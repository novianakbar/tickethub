import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFreshFileUrl } from "@/lib/s3";
import { createTicketActivity } from "@/lib/ticket-utils";

type RouteParams = {
    params: Promise<{ id: string }>;
};

// GET /api/tickets/[id]/attachments - Get ticket attachments with fresh URLs
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            select: {
                id: true,
                assigneeId: true,
                createdById: true,
            },
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        // Check permission
        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        if (profile.role !== "admin") {
            if (ticket.assigneeId !== session.user.id && ticket.createdById !== session.user.id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        const attachments = await prisma.attachment.findMany({
            where: { ticketId: id },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        // Regenerate fresh URLs
        const attachmentsWithFreshUrls = await Promise.all(
            attachments.map(async (att) => ({
                ...att,
                fileUrl: await getFreshFileUrl(att.fileKey),
            }))
        );

        return NextResponse.json({ attachments: attachmentsWithFreshUrls });
    } catch (error) {
        console.error("Ticket attachments fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/tickets/[id]/attachments - Add attachment to existing ticket
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            select: {
                id: true,
                ticketNumber: true,
                assigneeId: true,
                createdById: true,
            },
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        // Check permission
        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        if (profile.role !== "admin") {
            if (ticket.assigneeId !== session.user.id && ticket.createdById !== session.user.id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        const body = await request.json();
        const { attachments } = body;

        if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
            return NextResponse.json(
                { error: "No attachments provided" },
                { status: 400 }
            );
        }

        // Create attachments
        const createdAttachments = await prisma.attachment.createMany({
            data: attachments.map((att: {
                fileName: string;
                fileKey: string;
                fileUrl: string;
                fileSize: number;
                fileType: string;
            }) => ({
                ticketId: id,
                fileName: att.fileName,
                fileKey: att.fileKey,
                fileUrl: att.fileUrl,
                fileSize: att.fileSize,
                fileType: att.fileType,
                uploadedById: session.user.id,
            })),
        });

        // Create activity log
        await createTicketActivity({
            ticketId: id,
            authorId: session.user.id,
            type: "attachment_added",
            description: `${attachments.length} lampiran ditambahkan`,
        });

        // Fetch the created attachments with fresh URLs
        const newAttachments = await prisma.attachment.findMany({
            where: { ticketId: id },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: attachments.length,
        });

        const attachmentsWithFreshUrls = await Promise.all(
            newAttachments.map(async (att) => ({
                ...att,
                fileUrl: await getFreshFileUrl(att.fileKey),
            }))
        );

        return NextResponse.json({
            success: true,
            count: createdAttachments.count,
            attachments: attachmentsWithFreshUrls,
        }, { status: 201 });
    } catch (error) {
        console.error("Add attachment error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
