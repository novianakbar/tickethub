import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = {
    params: Promise<{ id: string }>;
};

// GET /api/attachments/[id]/download - Proxy download to handle CORS
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

        // Get the related ticket (could be from direct ticket, reply, or note)
        const relatedTicket = attachment.ticket
            || attachment.reply?.ticket
            || attachment.note?.ticket;

        if (profile.role !== "admin" && relatedTicket) {
            if (
                relatedTicket.assigneeId !== session.user.id &&
                relatedTicket.createdById !== session.user.id
            ) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        // Fetch file from S3
        const response = await fetch(attachment.fileUrl);

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
        }

        const blob = await response.blob();

        // Return file with proper headers for download
        return new NextResponse(blob, {
            headers: {
                "Content-Type": attachment.fileType,
                "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.fileName)}"`,
                "Content-Length": attachment.fileSize.toString(),
            },
        });
    } catch (error) {
        console.error("Download error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
