import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTicketActivity } from "@/lib/ticket-utils";
import { getFreshFileUrl } from "@/lib/s3";
import { notifyNewReply } from "@/lib/email-service";

type RouteParams = {
    params: Promise<{ id: string }>;
};

interface AttachmentInput {
    fileName: string;
    fileKey: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
}

// POST /api/tickets/[id]/reply - Add reply to ticket with optional attachments
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id },
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        // Permission check
        if (profile.role !== "admin") {
            // Allow if user is assignee OR creator OR ticket is unassigned
            if (ticket.assigneeId && ticket.assigneeId !== session.user.id && ticket.createdById !== session.user.id) {
                return NextResponse.json({ error: "Forbidden - Ticket is assigned to another agent" }, { status: 403 });
            }
        }

        const { message, attachments } = await request.json() as {
            message: string;
            attachments?: AttachmentInput[];
        };

        if (!message?.trim()) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Create reply with attachments in a transaction
        const reply = await prisma.$transaction(async (tx) => {
            // Create the reply
            const newReply = await tx.ticketReply.create({
                data: {
                    ticketId: id,
                    message: message.trim(),
                    authorId: session.user.id,
                },
            });

            // Create attachments if provided
            if (attachments && attachments.length > 0) {
                await tx.attachment.createMany({
                    data: attachments.map((att) => ({
                        replyId: newReply.id,
                        fileName: att.fileName,
                        fileKey: att.fileKey,
                        fileUrl: att.fileUrl,
                        fileSize: att.fileSize,
                        fileType: att.fileType,
                        uploadedById: session.user.id,
                    })),
                });
            }

            // Fetch reply with attachments and author
            return await tx.ticketReply.findUnique({
                where: { id: newReply.id },
                include: {
                    author: {
                        select: { id: true, fullName: true, email: true, avatarUrl: true },
                    },
                    attachments: true,
                },
            });
        });

        // Update ticket status or assignee
        const updateData: Record<string, unknown> = {};

        if (ticket.status === "open") {
            updateData.status = "in_progress";
        }

        // Auto-assign if currently unassigned and user is acting on it
        if (!ticket.assigneeId && profile.role !== "admin") {
            updateData.assigneeId = session.user.id;
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.ticket.update({
                where: { id },
                data: updateData,
            });
        }

        // Log activity
        const attachmentCount = attachments?.length || 0;
        const activityDesc = attachmentCount > 0
            ? `Balasan ditambahkan dengan ${attachmentCount} lampiran`
            : "Balasan ditambahkan";

        await createTicketActivity({
            ticketId: id,
            authorId: session.user.id,
            type: "reply",
            description: activityDesc,
        });

        // Log assignment if happened
        if (!ticket.assigneeId && profile.role !== "admin") {
            await createTicketActivity({
                ticketId: id,
                authorId: session.user.id,
                type: "assign",
                description: `Tiket otomatis diambil oleh ${profile.fullName || session.user.email} (via Balasan)`,
                oldValue: undefined,
                newValue: session.user.id,
            });
        }

        // Regenerate fresh URLs for attachments
        const replyWithFreshUrls = reply ? {
            ...reply,
            attachments: await Promise.all(
                reply.attachments.map(async (att) => ({
                    ...att,
                    fileUrl: await getFreshFileUrl(att.fileKey),
                }))
            ),
        } : reply;

        // Send email notification to customer (async, no await)
        if (reply) {
            const ticketForEmail = await prisma.ticket.findUnique({
                where: { id },
                include: {
                    category: true,
                    assignee: true,
                    createdBy: true,
                },
            });

            if (ticketForEmail) {
                notifyNewReply(ticketForEmail, {
                    ...reply,
                    author: reply.author,
                });
            }
        }

        return NextResponse.json({ reply: replyWithFreshUrls }, { status: 201 });
    } catch (error) {
        console.error("Reply create error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
