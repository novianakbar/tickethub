import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFreshFileUrl } from "@/lib/s3";

// GET /api/attachments - List all attachments (admin only)
export async function GET(request: Request) {
    try {
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

        // Only admins can list all attachments
        if (profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const ticketId = searchParams.get("ticketId");
        const fileType = searchParams.get("fileType"); // "image" or "document"
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        // Build where clause
        const where: Record<string, unknown> = {};

        if (ticketId) {
            where.ticketId = ticketId;
        }

        if (fileType === "image") {
            where.fileType = { startsWith: "image/" };
        } else if (fileType === "document") {
            where.fileType = { not: { startsWith: "image/" } };
        }

        const [attachments, total] = await Promise.all([
            prisma.attachment.findMany({
                where,
                include: {
                    ticket: {
                        select: {
                            id: true,
                            ticketNumber: true,
                            subject: true,
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
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.attachment.count({ where }),
        ]);

        // Regenerate fresh URLs for each attachment
        const attachmentsWithFreshUrls = await Promise.all(
            attachments.map(async (att) => ({
                ...att,
                fileUrl: await getFreshFileUrl(att.fileKey),
            }))
        );

        // Calculate stats
        const stats = await prisma.attachment.aggregate({
            _sum: { fileSize: true },
            _count: true,
        });

        return NextResponse.json({
            attachments: attachmentsWithFreshUrls,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                totalFiles: stats._count,
                totalSizeBytes: stats._sum.fileSize || 0,
            },
        });
    } catch (error) {
        console.error("Attachments fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
