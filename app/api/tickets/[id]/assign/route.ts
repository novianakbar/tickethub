import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTicketActivity } from "@/lib/ticket-utils";
import {
    notifyTicketAssigned,
    notifyAgentAssigned,
    notifyAgentUnassigned,
} from "@/lib/email-service";

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
            include: { level: true },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Only admin or users with canAssignTicket permission can assign tickets
        if (profile.role !== "admin" && !profile.level.canAssignTicket) {
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

        const { assigneeId, note } = await request.json();

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
        
        // Build description with optional note
        let activityDescription = assigneeId
            ? `Tiket ditugaskan ke ${newAssigneeName}`
            : "Tiket tidak lagi ditugaskan";
        
        if (note) {
            activityDescription += ` — ${note}`;
        }

        await createTicketActivity({
            ticketId: id,
            authorId: session.user.id,
            type: "assign",
            description: activityDescription,
            oldValue: ticket.assigneeId || undefined,
            newValue: assigneeId || undefined,
        });

        // Send email notifications (async, no await)
        // Fetch ticket with full relations for email
        const ticketForEmail = await prisma.ticket.findUnique({
            where: { id },
            include: {
                category: true,
                assignee: true,
                createdBy: true,
            },
        });

        if (ticketForEmail) {
            // Notify customer that ticket is assigned
            if (newAssignee) {
                notifyTicketAssigned(ticketForEmail, profile);
            }

            // Notify new agent
            if (newAssignee) {
                notifyAgentAssigned(ticketForEmail, newAssignee, profile);
            }

            // Notify old agent if reassigning
            if (ticket.assigneeId && newAssignee && ticket.assigneeId !== newAssignee.id) {
                const oldAgent = await prisma.profile.findUnique({
                    where: { id: ticket.assigneeId },
                });
                if (oldAgent) {
                    notifyAgentUnassigned(ticketForEmail, oldAgent, newAssignee);
                }
            }
        }

        return NextResponse.json({ ticket: updatedTicket });
    } catch (error) {
        console.error("Assign error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
