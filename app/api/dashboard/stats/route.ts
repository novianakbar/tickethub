import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type {
    DashboardStatsResponse,
    AgentStats,
    GlobalStats,
    TicketSummary,
    ActivitySummary,
    ChartData,
    TeamPerformance,
    TicketsByDayData,
    TicketsByCategoryData,
    TicketsByPriorityData
} from "@/types/dashboard";

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
    try {
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

        const isAdmin = profile.role === "admin";
        const userId = session.user.id;

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // ============================================
        // MY STATS (untuk semua user)
        // ============================================
        const myStats = await getMyStats(userId, today, tomorrow);

        // ============================================
        // URGENT TICKETS (prioritas high/urgent)
        // ============================================
        const urgentTickets = await getUrgentTickets(userId, isAdmin, profile);

        // ============================================
        // OVERDUE TICKETS
        // ============================================
        const overdueTickets = await getOverdueTickets(userId, isAdmin, profile);

        // ============================================
        // RECENT TICKETS
        // ============================================
        const recentTickets = await getRecentTickets(userId, isAdmin, profile);

        // ============================================
        // RECENT ACTIVITIES
        // ============================================
        const recentActivities = await getRecentActivities(userId, isAdmin, profile);

        // Base response
        const response: DashboardStatsResponse = {
            myStats,
            urgentTickets,
            overdueTickets,
            recentTickets,
            recentActivities,
            isAdmin,
            generatedAt: new Date().toISOString(),
        };

        // ============================================
        // ADMIN ONLY DATA
        // ============================================
        if (isAdmin) {
            response.globalStats = await getGlobalStats();
            response.chartData = await getChartData();
            response.teamPerformance = await getTeamPerformance();
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getMyStats(userId: string, today: Date, tomorrow: Date): Promise<AgentStats> {
    const [open, inProgress, pending, resolvedToday] = await Promise.all([
        prisma.ticket.count({
            where: { assigneeId: userId, status: "open" },
        }),
        prisma.ticket.count({
            where: { assigneeId: userId, status: "in_progress" },
        }),
        prisma.ticket.count({
            where: { assigneeId: userId, status: "pending" },
        }),
        prisma.ticket.count({
            where: {
                assigneeId: userId,
                status: "resolved",
                resolvedAt: { gte: today, lt: tomorrow },
            },
        }),
    ]);

    return { open, inProgress, pending, resolvedToday };
}

async function getUrgentTickets(
    userId: string,
    isAdmin: boolean,
    profile: { level: { canViewAllTickets: boolean; canViewTeamTickets: boolean; sortOrder: number } }
): Promise<TicketSummary[]> {
    const where = buildTicketWhereClause(userId, isAdmin, profile, {
        priority: { in: ["high", "urgent"] },
        status: { in: ["open", "in_progress", "pending"] },
    });

    const tickets = await prisma.ticket.findMany({
        where,
        include: {
            category: { select: { id: true, name: true, color: true } },
            level: { select: { id: true, code: true, name: true } },
            assignee: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
        take: 5,
    });

    return tickets.map(mapTicketToSummary);
}

async function getOverdueTickets(
    userId: string,
    isAdmin: boolean,
    profile: { level: { canViewAllTickets: boolean; canViewTeamTickets: boolean; sortOrder: number } }
): Promise<TicketSummary[]> {
    const now = new Date();

    const where = buildTicketWhereClause(userId, isAdmin, profile, {
        dueDate: { lt: now },
        status: { in: ["open", "in_progress", "pending"] },
    });

    const tickets = await prisma.ticket.findMany({
        where,
        include: {
            category: { select: { id: true, name: true, color: true } },
            level: { select: { id: true, code: true, name: true } },
            assignee: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
    });

    return tickets.map(mapTicketToSummary);
}

async function getRecentTickets(
    userId: string,
    isAdmin: boolean,
    profile: { level: { canViewAllTickets: boolean; canViewTeamTickets: boolean; sortOrder: number } }
): Promise<TicketSummary[]> {
    const where = buildTicketWhereClause(userId, isAdmin, profile, {
        status: { in: ["open", "in_progress", "pending"] },
    });

    const tickets = await prisma.ticket.findMany({
        where,
        include: {
            category: { select: { id: true, name: true, color: true } },
            level: { select: { id: true, code: true, name: true } },
            assignee: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    return tickets.map(mapTicketToSummary);
}

async function getRecentActivities(
    userId: string,
    isAdmin: boolean,
    profile: { level: { canViewAllTickets: boolean; canViewTeamTickets: boolean; sortOrder: number } }
): Promise<ActivitySummary[]> {
    // Build ticket filter for activities
    const ticketFilter = isAdmin
        ? {}
        : profile.level.canViewAllTickets
            ? {}
            : profile.level.canViewTeamTickets
                ? {
                    OR: [
                        { assigneeId: userId },
                        { createdById: userId },
                        { level: { sortOrder: { lte: profile.level.sortOrder } } },
                    ],
                }
                : {
                    OR: [
                        { assigneeId: userId },
                        { createdById: userId },
                    ],
                };

    const activities = await prisma.ticketActivity.findMany({
        where: {
            ticket: ticketFilter,
        },
        include: {
            author: { select: { id: true, fullName: true, email: true } },
            ticket: { select: { id: true, ticketNumber: true, subject: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    return activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        createdAt: activity.createdAt.toISOString(),
        author: {
            id: activity.author.id,
            fullName: activity.author.fullName,
            email: activity.author.email,
        },
        ticket: {
            id: activity.ticket.id,
            ticketNumber: activity.ticket.ticketNumber,
            subject: activity.ticket.subject,
        },
    }));
}

async function getGlobalStats(): Promise<GlobalStats> {
    const now = new Date();

    const [total, open, inProgress, pending, resolved, closed, unassigned, overdue] = await Promise.all([
        prisma.ticket.count(),
        prisma.ticket.count({ where: { status: "open" } }),
        prisma.ticket.count({ where: { status: "in_progress" } }),
        prisma.ticket.count({ where: { status: "pending" } }),
        prisma.ticket.count({ where: { status: "resolved" } }),
        prisma.ticket.count({ where: { status: "closed" } }),
        prisma.ticket.count({ where: { assigneeId: null, status: { in: ["open", "in_progress", "pending"] } } }),
        prisma.ticket.count({
            where: {
                dueDate: { lt: now },
                status: { in: ["open", "in_progress", "pending"] }
            }
        }),
    ]);

    return { total, open, inProgress, pending, resolved, closed, unassigned, overdue };
}

async function getChartData(): Promise<ChartData> {
    const [ticketsByDay, ticketsByCategory, ticketsByPriority] = await Promise.all([
        getTicketsByDay(),
        getTicketsByCategory(),
        getTicketsByPriority(),
    ]);

    return { ticketsByDay, ticketsByCategory, ticketsByPriority };
}

async function getTicketsByDay(): Promise<TicketsByDayData[]> {
    const result: TicketsByDayData[] = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const [created, resolved] = await Promise.all([
            prisma.ticket.count({
                where: {
                    createdAt: { gte: date, lt: nextDate },
                },
            }),
            prisma.ticket.count({
                where: {
                    resolvedAt: { gte: date, lt: nextDate },
                },
            }),
        ]);

        result.push({
            date: date.toISOString().split("T")[0],
            created,
            resolved,
        });
    }

    return result;
}

async function getTicketsByCategory(): Promise<TicketsByCategoryData[]> {
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
            _count: { select: { tickets: true } },
        },
        orderBy: { sortOrder: "asc" },
    });

    return categories.map((cat) => ({
        categoryId: cat.id,
        category: cat.name,
        count: cat._count.tickets,
        color: cat.color,
    }));
}

async function getTicketsByPriority(): Promise<TicketsByPriorityData[]> {
    const priorityLabels: Record<string, string> = {
        low: "Rendah",
        normal: "Normal",
        high: "Tinggi",
        urgent: "Mendesak",
    };

    const priorities = ["low", "normal", "high", "urgent"] as const;

    const counts = await Promise.all(
        priorities.map((priority) =>
            prisma.ticket.count({ where: { priority } })
        )
    );

    return priorities.map((priority, index) => ({
        priority,
        label: priorityLabels[priority],
        count: counts[index],
    }));
}

async function getTeamPerformance(): Promise<TeamPerformance[]> {
    const agents = await prisma.profile.findMany({
        where: {
            isActive: true,
            role: "agent",
        },
        include: {
            level: { select: { id: true, code: true, name: true } },
            ticketsAssigned: {
                select: {
                    status: true,
                    resolvedAt: true,
                    createdAt: true,
                },
            },
        },
        orderBy: { fullName: "asc" },
    });

    return agents.map((agent) => {
        const tickets = agent.ticketsAssigned;
        const openCount = tickets.filter((t) => t.status === "open").length;
        const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
        const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

        // Calculate average resolution time
        const resolvedTickets = tickets.filter((t) => t.resolvedAt);
        let avgResolutionHours: number | null = null;

        if (resolvedTickets.length > 0) {
            const totalHours = resolvedTickets.reduce((sum, t) => {
                if (t.resolvedAt) {
                    const hours = (t.resolvedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
                    return sum + hours;
                }
                return sum;
            }, 0);
            avgResolutionHours = Math.round((totalHours / resolvedTickets.length) * 10) / 10;
        }

        return {
            agentId: agent.id,
            agentName: agent.fullName || agent.email,
            agentEmail: agent.email,
            level: {
                id: agent.level.id,
                code: agent.level.code,
                name: agent.level.name,
            },
            openCount,
            inProgressCount,
            resolvedCount,
            avgResolutionHours,
        };
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function buildTicketWhereClause(
    userId: string,
    isAdmin: boolean,
    profile: { level: { canViewAllTickets: boolean; canViewTeamTickets: boolean; sortOrder: number } },
    additionalWhere: Record<string, unknown> = {}
): Record<string, unknown> {
    const where: Record<string, unknown> = { ...additionalWhere };

    if (!isAdmin) {
        if (profile.level.canViewAllTickets) {
            // Can view all - no filter
        } else if (profile.level.canViewTeamTickets) {
            where.OR = [
                { assigneeId: userId },
                { createdById: userId },
                { level: { sortOrder: { lte: profile.level.sortOrder } } },
            ];
        } else {
            where.OR = [
                { assigneeId: userId },
                { createdById: userId },
            ];
        }
    }

    return where;
}

function mapTicketToSummary(ticket: {
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    priority: string;
    level: { id: string; code: string; name: string };
    category: { id: string; name: string; color: string };
    customerName: string;
    customerEmail: string;
    assignee: { id: string; fullName: string | null; email: string } | null;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}): TicketSummary {
    return {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status as TicketSummary["status"],
        priority: ticket.priority as TicketSummary["priority"],
        level: {
            id: ticket.level.id,
            code: ticket.level.code,
            name: ticket.level.name,
        },
        category: {
            id: ticket.category.id,
            name: ticket.category.name,
            color: ticket.category.color,
        },
        customerName: ticket.customerName,
        customerEmail: ticket.customerEmail,
        assignee: ticket.assignee
            ? {
                id: ticket.assignee.id,
                fullName: ticket.assignee.fullName,
                email: ticket.assignee.email,
            }
            : null,
        dueDate: ticket.dueDate?.toISOString() ?? null,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
    };
}
