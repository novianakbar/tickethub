import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFreshFileUrl } from "@/lib/s3";

// POST /api/public/tickets/lookup - Public ticket lookup by number + email
export async function POST(request: Request) {
    try {
        const { ticketNumber, email } = await request.json();

        if (!ticketNumber || !email) {
            return NextResponse.json(
                { error: "Nomor tiket dan email diperlukan" },
                { status: 400 }
            );
        }

        const ticket = await prisma.ticket.findFirst({
            where: {
                ticketNumber: ticketNumber.toUpperCase(),
                customerEmail: email.toLowerCase(),
            },
            select: {
                id: true,
                ticketNumber: true,
                subject: true,
                status: true,
                priority: true,
                level: true,
                customerName: true,
                customerEmail: true,
                createdAt: true,
                updatedAt: true,
                resolvedAt: true,
                closedAt: true,
                category: {
                    select: {
                        name: true,
                        color: true,
                    },
                },
                replies: {
                    select: {
                        message: true,
                        createdAt: true,
                        isCustomer: true,
                        attachments: {
                            select: {
                                fileKey: true,
                                fileName: true,
                                fileUrl: true,
                                fileSize: true,
                                fileType: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
                // Public timeline - only safe activity types
                activities: {
                    where: {
                        type: {
                            in: ["created", "status_change", "reply", "escalate", "customer_reply"],
                        },
                    },
                    select: {
                        type: true,
                        description: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "asc" },
                },
                // Don't expose internal notes to public
                attachments: {
                    select: {
                        fileKey: true,
                        fileName: true,
                        fileUrl: true,
                        fileSize: true,
                        fileType: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!ticket) {
            return NextResponse.json(
                { error: "Tiket tidak ditemukan" },
                { status: 404 }
            );
        }

        // Regenerate fresh presigned URLs for attachments
        const attachmentsWithFreshUrls = await Promise.all(
            ticket.attachments.map(async (att) => ({
                fileName: att.fileName,
                fileUrl: await getFreshFileUrl(att.fileKey),
                fileSize: att.fileSize,
                fileType: att.fileType,
                createdAt: att.createdAt,
            }))
        );

        // Regenerate fresh URLs for reply attachments
        const repliesWithFreshUrls = await Promise.all(
            ticket.replies.map(async (reply) => ({
                ...reply,
                attachments: await Promise.all(
                    reply.attachments.map(async (att) => ({
                        fileName: att.fileName,
                        fileUrl: await getFreshFileUrl(att.fileKey),
                        fileSize: att.fileSize,
                        fileType: att.fileType,
                    }))
                ),
            }))
        );

        return NextResponse.json({
            ticket: {
                ...ticket,
                attachments: attachmentsWithFreshUrls,
                replies: repliesWithFreshUrls,
            },
        });
    } catch (error) {
        console.error("Public lookup error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan" },
            { status: 500 }
        );
    }
}
