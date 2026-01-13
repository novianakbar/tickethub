import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile, getFreshFileUrl } from "@/lib/s3";

type RouteParams = {
    params: Promise<{ id: string }>;
};

// Helper to get related ticket from attachment (can be from ticket, reply, or note)
function getRelatedTicket(attachment: {
    ticket: { assigneeId: string | null; createdById: string } | null;
    reply?: { ticket: { assigneeId: string | null; createdById: string } } | null;
    note?: { ticket: { assigneeId: string | null; createdById: string } } | null;
}) {
    return attachment.ticket
        || attachment.reply?.ticket
        || attachment.note?.ticket;
}

// GET /api/attachments/[id] - Get single attachment with fresh URL
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const attachment = await prisma.attachment.findUnique({
            where: { id },
            include: {
                ticket: {
                    select: {
                        id: true,
                        ticketNumber: true,
                        subject: true,
                        assigneeId: true,
                        createdById: true,
                    },
                },
                reply: {
                    select: {
                        ticket: {
                            select: {
                                assigneeId: true,
                                createdById: true,
                            },
                        },
                    },
                },
                note: {
                    select: {
                        ticket: {
                            select: {
                                assigneeId: true,
                                createdById: true,
                            },
                        },
                    },
                },
                uploadedBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        if (!attachment) {
            return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
        }

        // Check permission
        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const relatedTicket = getRelatedTicket(attachment);
        if (profile.role !== "admin" && relatedTicket) {
            if (
                relatedTicket.assigneeId !== session.user.id &&
                relatedTicket.createdById !== session.user.id
            ) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        // Return attachment with fresh URL
        return NextResponse.json({
            attachment: {
                ...attachment,
                fileUrl: await getFreshFileUrl(attachment.fileKey),
            },
        });
    } catch (error) {
        console.error("Attachment fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/attachments/[id] - Delete attachment
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const attachment = await prisma.attachment.findUnique({
            where: { id },
            include: {
                ticket: {
                    select: {
                        id: true,
                        ticketNumber: true,
                        assigneeId: true,
                        createdById: true,
                    },
                },
                reply: {
                    select: {
                        ticket: {
                            select: {
                                assigneeId: true,
                                createdById: true,
                            },
                        },
                    },
                },
                note: {
                    select: {
                        ticket: {
                            select: {
                                assigneeId: true,
                                createdById: true,
                            },
                        },
                    },
                },
            },
        });

        if (!attachment) {
            return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
        }

        // Check permission
        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const relatedTicket = getRelatedTicket(attachment);
        if (profile.role !== "admin" && relatedTicket) {
            if (
                relatedTicket.assigneeId !== session.user.id &&
                relatedTicket.createdById !== session.user.id
            ) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        // Delete from S3
        const s3Deleted = await deleteFile(attachment.fileKey);

        if (!s3Deleted) {
            console.warn(`Failed to delete file from S3: ${attachment.fileKey}`);
        }

        // Delete from database
        await prisma.attachment.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Attachment deleted successfully",
        });
    } catch (error) {
        console.error("Attachment delete error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
