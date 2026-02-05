"use client";

import {
    Ticket,
    Clock,
    Zap,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";

import {
    StatsCard,
    UrgentTicketsList,
    RecentActivityFeed,
    RecentTicketsList,
    AgentQuickActions,
    PerformanceKPICard,
    StalledTicketsList,
} from "@/components/dashboard";
import type { DashboardStatsResponse } from "@/types/dashboard";

interface AgentDashboardViewProps {
    data: DashboardStatsResponse;
}

export function AgentDashboardView({ data }: AgentDashboardViewProps) {
    return (
        <div className="space-y-6">
            {/* ============================================ */}
            {/* PERSONAL STATS - Top priority for Agent */}
            {/* ============================================ */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Tiket Open"
                    value={data.myStats.open}
                    description="Menunggu dikerjakan"
                    icon={Ticket}
                    iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    onClick={() => window.location.href = "/admin/tickets?status=open&assigneeId=me"}
                />
                <StatsCard
                    title="Sedang Diproses"
                    value={data.myStats.inProgress}
                    description="Tiket aktif saya"
                    icon={Zap}
                    iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    onClick={() => window.location.href = "/admin/tickets?status=in_progress&assigneeId=me"}
                />
                <StatsCard
                    title="Jatuh Tempo < 24h"
                    value={data.myStats.dueSoon}
                    description="Segera tangani"
                    icon={AlertTriangle}
                    iconClassName="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                />
                <StatsCard
                    title="Selesai Hari Ini"
                    value={data.myStats.resolvedToday}
                    description="Pencapaian harian"
                    icon={CheckCircle}
                    iconClassName="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                />
            </div>

            {/* PERFORMANCE & STALLED */}
            <div className="grid gap-6 lg:grid-cols-2">
                <PerformanceKPICard
                    avgResponseTime={data.myStats.avgResponseTime}
                    avgResolutionTime={data.myStats.avgResolutionTime}
                />
                {data.myStats.stalled > 0 && (
                    <StalledTicketsList count={data.myStats.stalled} />
                )}
            </div>

            {/* ============================================ */}
            {/* QUICK ACTIONS */}
            {/* ============================================ */}
            <AgentQuickActions />

            {/* ============================================ */}
            {/* URGENT & ACTIVITY */}
            {/* ============================================ */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Urgent & Overdue Tickets (Assigned to Me / Visible to Me) */}
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
                title="Tiket Saya Terbaru"
                description="Tiket yang ditugaskan kepada Anda atau tim Anda"
                viewAllHref="/admin/tickets?assigneeId=me"
            />
        </div>
    );
}
