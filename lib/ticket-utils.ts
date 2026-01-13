import { prisma } from "@/lib/prisma";
import type { TicketStatus, TicketPriority } from "@prisma/client";

/**
 * Generate unique ticket number: TKT-XXXXXX
 */
export async function generateTicketNumber(): Promise<string> {
    const prefix = "TKT";
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    // Get today's count
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const todayCount = await prisma.ticket.count({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    const sequence = (todayCount + 1).toString().padStart(4, "0");
    const ticketNumber = `${prefix}-${year}${month}${sequence}`;

    // Verify uniqueness
    const exists = await prisma.ticket.findUnique({
        where: { ticketNumber },
    });

    if (exists) {
        // Fallback: add random suffix
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${prefix}-${year}${month}${random}`;
    }

    return ticketNumber;
}

/**
 * Create activity log for ticket
 */
export async function createTicketActivity({
    ticketId,
    authorId,
    type,
    description,
    oldValue,
    newValue,
}: {
    ticketId: string;
    authorId: string;
    type: string;
    description: string;
    oldValue?: string | null;
    newValue?: string | null;
}) {
    return prisma.ticketActivity.create({
        data: {
            ticketId,
            authorId,
            type,
            description,
            oldValue,
            newValue,
        },
    });
}

/**
 * Get status label in Indonesian
 */
export const statusLabels: Record<TicketStatus, string> = {
    open: "Menunggu",
    in_progress: "Diproses",
    pending: "Pending",
    resolved: "Selesai",
    closed: "Ditutup",
};

/**
 * Get priority label in Indonesian
 */
export const priorityLabels: Record<TicketPriority, string> = {
    low: "Rendah",
    normal: "Normal",
    high: "Tinggi",
    urgent: "Mendesak",
};

/**
 * Check if user can view ticket based on permissions
 */
export function canViewTicket(
    userRole: string,
    canViewAllTickets: boolean,
    canViewTeamTickets: boolean,
    ticketAssigneeId: string | null,
    ticketCreatedById: string,
    userId: string
): boolean {
    // Admin can view all
    if (userRole === "admin") return true;

    // Level-based permission
    if (canViewAllTickets) return true;

    // Agent can view their assigned or created tickets
    if (ticketAssigneeId === userId || ticketCreatedById === userId) return true;

    return false;
}

/**
 * Check if user can update ticket
 */
export function canUpdateTicket(
    userRole: string,
    ticketAssigneeId: string | null,
    ticketCreatedById: string,
    userId: string
): boolean {
    // Admin can update all
    if (userRole === "admin") return true;

    // Agent can update their assigned or created tickets
    if (ticketAssigneeId === userId || ticketCreatedById === userId) return true;

    return false;
}

/**
 * Get next escalation level
 * @param currentLevelSortOrder - The sortOrder of the current level
 * @returns The next level or null if already at highest
 */
export async function getNextLevel(currentLevelSortOrder: number) {
    const nextLevel = await prisma.supportLevel.findFirst({
        where: {
            sortOrder: { gt: currentLevelSortOrder },
            isActive: true,
        },
        orderBy: { sortOrder: "asc" },
    });

    return nextLevel;
}

