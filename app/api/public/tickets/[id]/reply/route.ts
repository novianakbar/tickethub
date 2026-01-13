import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = {
    params: Promise<{ id: string }>;
};

// POST /api/public/tickets/[id]/reply - Customer reply to ticket
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { message, email, ticketNumber } = await request.json();

        // Validate required fields
        if (!message?.trim()) {
            return NextResponse.json(
                { error: "Pesan tidak boleh kosong" },
                { status: 400 }
            );
        }

        if (!email || !ticketNumber) {
            return NextResponse.json(
                { error: "Email dan nomor tiket diperlukan" },
                { status: 400 }
            );
        }

        // Verify ticket ownership and get createdBy for activity log
        const ticket = await prisma.ticket.findFirst({
            where: {
                id,
                ticketNumber: ticketNumber.toUpperCase(),
                customerEmail: email.toLowerCase(),
            },
            select: {
                id: true,
                status: true,
                createdById: true,
            },
        });

        if (!ticket) {
            return NextResponse.json(
                { error: "Tiket tidak ditemukan atau email tidak cocok" },
                { status: 404 }
            );
        }

        // Create customer reply
        const reply = await prisma.ticketReply.create({
            data: {
                ticketId: id,
                message: message.trim(),
                isCustomer: true,
                authorId: null,
            },
        });

        // Use createdById for activity logging (the agent who created the ticket)
        const activityAuthorId = ticket.createdById;

        // Update ticket status to pending if it was resolved/closed
        if (ticket.status === "resolved" || ticket.status === "closed") {
            await prisma.ticket.update({
                where: { id },
                data: { status: "pending" },
            });

            // Log status change activity
            await prisma.ticketActivity.create({
                data: {
                    ticketId: id,
                    authorId: activityAuthorId,
                    type: "status_change",
                    description: "Status diubah ke Menunggu Respons (balasan pelanggan)",
                    oldValue: ticket.status,
                    newValue: "pending",
                },
            });
        }

        // Log customer reply activity
        await prisma.ticketActivity.create({
            data: {
                ticketId: id,
                authorId: activityAuthorId,
                type: "customer_reply",
                description: "Pelanggan memberikan balasan",
            },
        });

        return NextResponse.json({
            success: true,
            reply: {
                id: reply.id,
                message: reply.message,
                isCustomer: reply.isCustomer,
                createdAt: reply.createdAt,
            },
        }, { status: 201 });
    } catch (error) {
        console.error("Customer reply error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan" },
            { status: 500 }
        );
    }
}

