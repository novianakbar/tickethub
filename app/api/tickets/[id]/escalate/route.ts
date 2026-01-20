import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTicketActivity, getNextLevel } from "@/lib/ticket-utils";

type RouteParams = {
    params: Promise<{ id: string }>;
};

// POST /api/tickets/[id]/escalate - Escalate ticket to next level
export async function POST(request: Request, { params }: RouteParams) {
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

        // Permission check - assigned agent or creator can escalate
        if (profile.role !== "admin") {
            // Allow if user is assignee OR creator OR ticket is unassigned
            if (ticket.assigneeId && ticket.assigneeId !== session.user.id && ticket.createdById !== session.user.id) {
                return NextResponse.json({ error: "Forbidden - Ticket is assigned to another agent" }, { status: 403 });
            }
            // Check if user has permission to escalate
            if (!profile.level.canEscalateTicket) {
                return NextResponse.json({ error: "Tidak memiliki izin untuk eskalasi tiket" }, { status: 403 });
            }
        }

        // Get next level
        const nextLevel = await getNextLevel(ticket.level.sortOrder);

        if (!nextLevel) {
            return NextResponse.json(
                { error: "Tiket sudah di level tertinggi" },
                { status: 400 }
            );
        }

        const { reason } = await request.json();

        // Update ticket
        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: {
                levelId: nextLevel.id,
                assigneeId: null, // Unassign when escalating
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
            },
        });

        // Log activity
        await createTicketActivity({
            ticketId: id,
            authorId: session.user.id,
            type: "escalate",
            description: reason ? `Tiket dieskalasi ke ${nextLevel.name} (${nextLevel.code}): ${reason}` : `Tiket dieskalasi ke ${nextLevel.name} (${nextLevel.code})`,
            oldValue: ticket.level.code,
            newValue: nextLevel.code,
        });

        return NextResponse.json({ ticket: updatedTicket });
    } catch (error) {
        console.error("Escalate error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

