"use client";

import {
    Ticket,
    Zap,
    UserX,
    AlertCircle,
} from "lucide-react";

import {
    StatsCard,
    UrgentTicketsList,
    RecentActivityFeed,
    RecentTicketsList,
    TicketTrendChart,
    CategoryDistributionChart,
    TeamPerformanceTable,
    AdminQuickActions,
    PerformanceKPICard,
    StalledTicketsList,
    TicketSourceChart,
} from "@/components/dashboard";
import type { DashboardStatsResponse } from "@/types/dashboard";

interface AdminDashboardViewProps {
    data: DashboardStatsResponse;
}

export function AdminDashboardView({ data }: AdminDashboardViewProps) {
    // Determine active tickets count (Open + In Progress + Pending)
    const activeTicketsCount = (data.globalStats?.open || 0) +
        (data.globalStats?.inProgress || 0) +
        (data.globalStats?.pending || 0);

    return (
        <div className="space-y-6">
            {/* ============================================ */}
            {/* GLOBAL STATS - Top priority for Admin */}
            {/* ============================================ */}
            {data.globalStats && (
                <div className="space-y-6">
                    {/* KPI CARDS */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Total Tiket"
                            value={data.globalStats.total}
                            description="Semua tiket masuk"
                            icon={Ticket}
                            iconClassName="bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400"
                            onClick={() => window.location.href = "/admin/tickets"}
                        />
                        <StatsCard
                            title="Tiket Aktif"
                            value={activeTicketsCount}
                            description="Perlu penanganan"
                            icon={Zap}
                            iconClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                            onClick={() => window.location.href = "/admin/tickets?status=open&status=in_progress&status=pending"}
                        />
                        <StatsCard
                            title="Unassigned"
                            value={data.globalStats.unassigned}
                            description="Belum ditugaskan"
                            icon={UserX}
                            iconClassName="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            onClick={() => window.location.href = "/admin/tickets?assigneeId=unassigned"}
                        />
                        <StatsCard
                            title="Overdue"
                            value={data.globalStats.overdue}
                            description="Melewati tenggat"
                            icon={AlertCircle}
                            iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        />
                    </div>

                    {/* NEW: Performance KPI & Stalled Tickets */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <PerformanceKPICard
                            avgResponseTime={data.globalStats.avgResponseTime}
                            avgResolutionTime={data.globalStats.avgResolutionTime}
                        />
                        <StalledTicketsList count={data.globalStats.stalled} />
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* QUICK ACTIONS */}
            {/* ============================================ */}
            <AdminQuickActions
                unassignedCount={data.globalStats?.unassigned}
            />

            {/* ============================================ */}
            {/* CHARTS SECTIONS */}
            {/* ============================================ */}
            {data.chartData && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <TicketTrendChart data={data.chartData.ticketsByDay} />
                    <div className="space-y-6">
                        <CategoryDistributionChart data={data.chartData.ticketsByCategory} />
                        <TicketSourceChart data={data.chartData.ticketsBySource} />
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* TEAM PERFORMANCE */}
            {/* ============================================ */}
            {data.teamPerformance && data.teamPerformance.length > 0 && (
                <TeamPerformanceTable data={data.teamPerformance} />
            )}

            {/* ============================================ */}
            {/* URGENT & ACTIVITY */}
            {/* ============================================ */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Urgent & Overdue Tickets */}
                <UrgentTicketsList
                    urgentTickets={data.urgentTickets}
                    overdueTickets={data.overdueTickets}
                />

                {/* Recent Activity Feed */}
                <RecentActivityFeed activities={data.recentActivities} />
            </div>

            {/* ============================================ */}
            {/* RECENT TICKETS */}
            {/* ============================================ */}
            <RecentTicketsList
                tickets={data.recentTickets}
                title="Tiket Terbaru"
                description="Semua tiket terbaru yang masuk ke sistem"
                viewAllHref="/admin/tickets"
            />
        </div>
    );
}
