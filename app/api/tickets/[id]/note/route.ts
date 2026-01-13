import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTicketActivity } from "@/lib/ticket-utils";
import { getFreshFileUrl } from "@/lib/s3";

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

// POST /api/tickets/[id]/note - Add internal note with optional attachments
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
            if (ticket.assigneeId !== session.user.id && ticket.createdById !== session.user.id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        const { content, attachments } = await request.json() as {
            content: string;
            attachments?: AttachmentInput[];
        };

        if (!content?.trim()) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

        // Create note with attachments in a transaction
        const note = await prisma.$transaction(async (tx) => {
            // Create the note
            const newNote = await tx.ticketNote.create({
                data: {
                    ticketId: id,
                    content: content.trim(),
                    authorId: session.user.id,
                },
            });

            // Create attachments if provided
            if (attachments && attachments.length > 0) {
                await tx.attachment.createMany({
                    data: attachments.map((att) => ({
                        noteId: newNote.id,
                        fileName: att.fileName,
                        fileKey: att.fileKey,
                        fileUrl: att.fileUrl,
                        fileSize: att.fileSize,
                        fileType: att.fileType,
                        uploadedById: session.user.id,
                    })),
                });
            }

            // Fetch note with attachments and author
            return await tx.ticketNote.findUnique({
                where: { id: newNote.id },
                include: {
                    author: {
                        select: { id: true, fullName: true, email: true, avatarUrl: true },
                    },
                    attachments: true,
                },
            });
        });

        // Log activity
        const attachmentCount = attachments?.length || 0;
        const activityDesc = attachmentCount > 0
            ? `Catatan internal ditambahkan dengan ${attachmentCount} lampiran`
            : "Catatan internal ditambahkan";

        await createTicketActivity({
            ticketId: id,
            authorId: session.user.id,
            type: "note",
            description: activityDesc,
        });

        // Regenerate fresh URLs for attachments
        const noteWithFreshUrls = note ? {
            ...note,
            attachments: await Promise.all(
                note.attachments.map(async (att) => ({
                    ...att,
                    fileUrl: await getFreshFileUrl(att.fileKey),
                }))
            ),
        } : note;

        return NextResponse.json({ note: noteWithFreshUrls }, { status: 201 });
    } catch (error) {
        console.error("Note create error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
