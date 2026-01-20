// Dashboard Types
// Centralized type definitions for dashboard-related data

import type { TicketStatus, TicketPriority, TicketCategory, Author, SupportLevel } from "./ticket";

// ============================================
// TICKET SUMMARY (lightweight version for lists)
// ============================================

export interface TicketSummary {
    id: string;
    ticketNumber: string;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    level: SupportLevel;
    category: TicketCategory;
    customerName: string;
    customerEmail: string;
    assignee: Author | null;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// ACTIVITY SUMMARY (for activity feed)
// ============================================

export interface ActivitySummary {
    id: string;
    type: string;
    description: string;
    createdAt: string;
    author: Author;
    ticket: {
        id: string;
        ticketNumber: string;
        subject: string;
    };
}

// ============================================
// AGENT DASHBOARD STATS
// ============================================

export interface AgentStats {
    open: number;           // Tiket open yang di-assign ke saya
    inProgress: number;     // Tiket in_progress yang saya kerjakan
    pending: number;        // Tiket pending menunggu respons
    resolvedToday: number;  // Tiket resolved hari ini
}

export interface AgentDashboardData {
    myStats: AgentStats;
    urgentTickets: TicketSummary[];     // Tiket prioritas tinggi/urgent (max 5)
    overdueTickets: TicketSummary[];    // Tiket yang overdue (max 5)
    recentTickets: TicketSummary[];     // Tiket terbaru saya (max 10)
    recentActivities: ActivitySummary[]; // Aktivitas terakhir (max 10)
}

// ============================================
// ADMIN DASHBOARD STATS
// ============================================

export interface GlobalStats {
    total: number;
    open: number;
    inProgress: number;
    pending: number;
    resolved: number;
    closed: number;
    unassigned: number;
    overdue: number;
}

export interface TicketsByDayData {
    date: string;       // Format: "2024-01-13"
    created: number;
    resolved: number;
}

export interface TicketsByCategoryData {
    categoryId: string;
    category: string;
    count: number;
    color: string;
}

export interface TicketsByPriorityData {
    priority: TicketPriority;
    label: string;
    count: number;
}

export interface ChartData {
    ticketsByDay: TicketsByDayData[];           // 7 hari terakhir
    ticketsByCategory: TicketsByCategoryData[];
    ticketsByPriority: TicketsByPriorityData[];
}

export interface TeamPerformance {
    agentId: string;
    agentName: string;
    agentEmail: string;
    level: SupportLevel;
    openCount: number;
    inProgressCount: number;
    resolvedCount: number;
    avgResolutionHours: number | null;  // dalam jam, null jika belum ada data
}

export interface AdminDashboardData extends AgentDashboardData {
    globalStats: GlobalStats;
    chartData: ChartData;
    teamPerformance: TeamPerformance[];
}

// ============================================
// API RESPONSE TYPE
// ============================================

export interface DashboardStatsResponse {
    // Always present
    myStats: AgentStats;
    urgentTickets: TicketSummary[];
    overdueTickets: TicketSummary[];
    recentTickets: TicketSummary[];
    recentActivities: ActivitySummary[];

    // Only for admin
    globalStats?: GlobalStats;
    chartData?: ChartData;
    teamPerformance?: TeamPerformance[];

    // Metadata
    isAdmin: boolean;
    generatedAt: string;
}
