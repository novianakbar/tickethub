import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTicketActivity } from "@/lib/ticket-utils";

type RouteParams = {
    params: Promise<{ id: string }>;
};

// POST /api/tickets/[id]/assign - Assign ticket to agent
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

        // Only admin can assign tickets
        if (profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                assignee: {
                    select: { fullName: true, email: true },
                },
            },
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        const { assigneeId } = await request.json();

        // Get new assignee info
        let newAssignee = null;
        if (assigneeId) {
            newAssignee = await prisma.profile.findUnique({
                where: { id: assigneeId },
                select: { id: true, fullName: true, email: true },
            });

            if (!newAssignee) {
                return NextResponse.json(
                    { error: "Assignee not found" },
                    { status: 400 }
                );
            }
        }

        // Update ticket
        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: { assigneeId: assigneeId || null },
            include: {
                category: true,
                assignee: {
                    select: { id: true, fullName: true, email: true },
                },
                createdBy: {
                    select: { id: true, fullName: true, email: true },
                },
            },
        });

        // Log activity
        const oldAssigneeName = ticket.assignee?.fullName || ticket.assignee?.email || "Tidak ada";
        const newAssigneeName = newAssignee?.fullName || newAssignee?.email || "Tidak ada";

        await createTicketActivity({
            ticketId: id,
            authorId: session.user.id,
            type: "assign",
            description: assigneeId
                ? "Tiket ditugaskan ke petugas"
                : "Tiket tidak lagi ditugaskan",
            oldValue: ticket.assigneeId || undefined,
            newValue: assigneeId || undefined,
        });

        return NextResponse.json({ ticket: updatedTicket });
    } catch (error) {
        console.error("Assign error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
