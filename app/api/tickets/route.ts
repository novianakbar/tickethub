import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTicketNumber, createTicketActivity } from "@/lib/ticket-utils";
import type { TicketStatus, TicketPriority, TicketSource } from "@prisma/client";

// GET /api/tickets - List tickets with filters
export async function GET(request: Request) {
    try {
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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as TicketStatus | null;
        const priority = searchParams.get("priority") as TicketPriority | null;
        const levelId = searchParams.get("levelId");
        const categoryId = searchParams.get("categoryId");
        const assigneeId = searchParams.get("assigneeId");
        const search = searchParams.get("search");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        // Build where clause
        const where: Record<string, unknown> = {};

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (levelId) where.levelId = levelId;
        if (categoryId) where.categoryId = categoryId;

        // Filter by assignee or "my tickets"
        if (assigneeId === "me") {
            where.assigneeId = session.user.id;
        } else if (assigneeId === "unassigned") {
            where.assigneeId = null;
        } else if (assigneeId) {
            where.assigneeId = assigneeId;
        }

        // Search
        if (search) {
            where.OR = [
                { ticketNumber: { contains: search, mode: "insensitive" } },
                { subject: { contains: search, mode: "insensitive" } },
                { customerName: { contains: search, mode: "insensitive" } },
                { customerEmail: { contains: search, mode: "insensitive" } },
            ];
        }

        // Permission-based filtering for non-admin users
        if (profile.role !== "admin") {
            if (profile.level.canViewAllTickets) {
                // Can view all tickets - no additional filter
            } else if (profile.level.canViewTeamTickets) {
                // Can view own tickets + tickets at same level or lower
                where.OR = [
                    { assigneeId: session.user.id },
                    { createdById: session.user.id },
                    { level: { sortOrder: { lte: profile.level.sortOrder } } },
                ];
            } else {
                // Can only view own tickets
                where.OR = [
                    { assigneeId: session.user.id },
                    { createdById: session.user.id },
                ];
            }
        }

        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
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
                    _count: {
                        select: { replies: true, attachments: true },
                    },
                },
                orderBy: [
                    { priority: "desc" },
                    { createdAt: "desc" },
                ],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.ticket.count({ where }),
        ]);

        return NextResponse.json({
            tickets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Tickets fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/tickets - Create new ticket
export async function POST(request: Request) {
    try {
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

        // Check if user can create tickets
        if (!profile.level.canCreateTicket && profile.role !== "admin") {
            return NextResponse.json({ error: "Tidak memiliki izin untuk membuat tiket" }, { status: 403 });
        }

        const body = await request.json();
        const {
            subject,
            description,
            categoryId,
            priority = "normal",
            levelId, // Now using levelId instead of level enum
            source = "phone",
            customerName,
            customerEmail,
            customerPhone,
            customerCompany,
            assigneeId,
            dueDate,
            attachments, // Array of { fileName, fileKey, fileUrl, fileSize, fileType }
        } = body;

        // Validation
        if (!subject || !description || !categoryId || !customerName || !customerEmail || !levelId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify category exists
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 400 }
            );
        }

        // Verify level exists
        const level = await prisma.supportLevel.findUnique({
            where: { id: levelId },
        });

        if (!level) {
            return NextResponse.json(
                { error: "Level not found" },
                { status: 400 }
            );
        }

        // Generate ticket number
        const ticketNumber = await generateTicketNumber();

        // Create ticket
        const ticket = await prisma.ticket.create({
            data: {
                ticketNumber,
                subject,
                description,
                categoryId,
                priority: priority as TicketPriority,
                levelId,
                source: source as TicketSource,
                customerName,
                customerEmail,
                customerPhone,
                customerCompany,
                assigneeId: assigneeId || null,
                createdById: session.user.id,
                dueDate: dueDate ? new Date(dueDate) : null,
                attachments: attachments?.length
                    ? {
                        create: attachments.map((att: {
                            fileName: string;
                            fileKey: string;
                            fileUrl: string;
                            fileSize: number;
                            fileType: string;
                        }) => ({
                            fileName: att.fileName,
                            fileKey: att.fileKey,
                            fileUrl: att.fileUrl,
                            fileSize: att.fileSize,
                            fileType: att.fileType,
                            uploadedById: session.user.id,
                        })),
                    }
                    : undefined,
            },
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
                attachments: true,
            },
        });

        // Create activity log
        await createTicketActivity({
            ticketId: ticket.id,
            authorId: session.user.id,
            type: "created",
            description: "Tiket berhasil dibuat",
        });

        return NextResponse.json({ ticket }, { status: 201 });
    } catch (error) {
        console.error("Ticket create error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

