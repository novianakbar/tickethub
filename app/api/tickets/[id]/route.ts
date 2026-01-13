import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTicketActivity, statusLabels, priorityLabels } from "@/lib/ticket-utils";
import { getFreshFileUrl } from "@/lib/s3";
import type { TicketStatus, TicketPriority } from "@prisma/client";

type RouteParams = {
    params: Promise<{ id: string }>;
};

// GET /api/tickets/[id] - Get ticket detail
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
            include: { level: true },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                category: true,
                level: {
                    select: { id: true, code: true, name: true, sortOrder: true },
                },
                assignee: {
                    select: { id: true, fullName: true, email: true, avatarUrl: true },
                },
                createdBy: {
                    select: { id: true, fullName: true, email: true, avatarUrl: true },
                },
                replies: {
                    include: {
                        author: {
                            select: { id: true, fullName: true, email: true, avatarUrl: true },
                        },
                        attachments: true,
                    },
                    orderBy: { createdAt: "asc" },
                },
                notes: {
                    include: {
                        author: {
                            select: { id: true, fullName: true, email: true, avatarUrl: true },
                        },
                        attachments: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
                activities: {
                    include: {
                        author: {
                            select: { id: true, fullName: true, email: true },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
                attachments: {
                    include: {
                        uploadedBy: {
                            select: { id: true, fullName: true, email: true },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        // Permission check for non-admin
        if (profile.role !== "admin") {
            const canView =
                ticket.assigneeId === session.user.id ||
                ticket.createdById === session.user.id ||
                profile.level.canViewAllTickets ||
                (profile.level.canViewTeamTickets && ticket.level.sortOrder <= profile.level.sortOrder);

            if (!canView) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        // Regenerate fresh presigned URLs for all attachments
        const attachmentsWithFreshUrls = await Promise.all(
            ticket.attachments.map(async (att) => ({
                ...att,
                fileUrl: await getFreshFileUrl(att.fileKey),
            }))
        );

        // Regenerate fresh URLs for reply attachments
        const repliesWithFreshUrls = await Promise.all(
            ticket.replies.map(async (reply) => ({
                ...reply,
                attachments: await Promise.all(
                    reply.attachments.map(async (att) => ({
                        ...att,
                        fileUrl: await getFreshFileUrl(att.fileKey),
                    }))
                ),
            }))
        );

        // Regenerate fresh URLs for note attachments
        const notesWithFreshUrls = await Promise.all(
            ticket.notes.map(async (note) => ({
                ...note,
                attachments: await Promise.all(
                    note.attachments.map(async (att) => ({
                        ...att,
                        fileUrl: await getFreshFileUrl(att.fileKey),
                    }))
                ),
            }))
        );

        return NextResponse.json({
            ticket: {
                ...ticket,
                attachments: attachmentsWithFreshUrls,
                replies: repliesWithFreshUrls,
                notes: notesWithFreshUrls,
            },
        });
    } catch (error) {
        console.error("Ticket fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/tickets/[id] - Update ticket
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
            include: { level: true },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: { level: true },
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        // Permission check
        if (profile.role !== "admin") {
            if (ticket.assigneeId !== session.user.id && ticket.createdById !== session.user.id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        const body = await request.json();
        const {
            status,
            priority,
            levelId,
            categoryId,
            subject,
            description,
            customerName,
            customerEmail,
            customerPhone,
            customerCompany,
            dueDate,
        } = body;

        const updates: Record<string, unknown> = {};
        const activities: Array<{
            type: string;
            description: string;
            oldValue?: string;
            newValue?: string;
        }> = [];

        // Track changes
        if (status && status !== ticket.status) {
            updates.status = status as TicketStatus;
            activities.push({
                type: "status_change",
                description: `Status diubah dari ${statusLabels[ticket.status]} ke ${statusLabels[status as TicketStatus]}`,
                oldValue: ticket.status,
                newValue: status,
            });

            // Set resolved/closed timestamps
            if (status === "resolved" && !ticket.resolvedAt) {
                updates.resolvedAt = new Date();
            }
            if (status === "closed" && !ticket.closedAt) {
                updates.closedAt = new Date();
            }
        }

        if (priority && priority !== ticket.priority) {
            updates.priority = priority as TicketPriority;
            activities.push({
                type: "priority_change",
                description: `Prioritas diubah dari ${priorityLabels[ticket.priority]} ke ${priorityLabels[priority as TicketPriority]}`,
                oldValue: ticket.priority,
                newValue: priority,
            });
        }

        if (levelId && levelId !== ticket.levelId) {
            // Get new level info
            const newLevel = await prisma.supportLevel.findUnique({
                where: { id: levelId },
            });

            if (newLevel) {
                updates.levelId = levelId;
                activities.push({
                    type: "level_change",
                    description: `Level diubah dari ${ticket.level.code} - ${ticket.level.name} ke ${newLevel.code} - ${newLevel.name}`,
                    oldValue: ticket.level.code,
                    newValue: newLevel.code,
                });
            }
        }

        if (categoryId) updates.categoryId = categoryId;
        if (subject) updates.subject = subject;
        if (description) updates.description = description;
        if (customerName) updates.customerName = customerName;
        if (customerEmail) updates.customerEmail = customerEmail;
        if (customerPhone !== undefined) updates.customerPhone = customerPhone;
        if (customerCompany !== undefined) updates.customerCompany = customerCompany;
        if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;

        // Update ticket
        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: updates,
            include: {
                category: true,
                level: {
                    select: { id: true, code: true, name: true },
                },
                assignee: {
                    select: { id: true, fullName: true, email: true },
                },
                createdBy: {
                    select: { id: true, fullName: true, email: true },
                },
            },
        });

        // Create activity logs
        for (const activity of activities) {
            await createTicketActivity({
                ticketId: id,
                authorId: session.user.id,
                ...activity,
            });
        }

        return NextResponse.json({ ticket: updatedTicket });
    } catch (error) {
        console.error("Ticket update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

