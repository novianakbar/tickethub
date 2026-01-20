"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { useDashboard } from "@/hooks/useDashboard";
import { toast } from "sonner";
import {
    Ticket,
    Clock,
    Zap,
    CheckCircle,
    AlertCircle,
    UserX,
    RefreshCw,
    Plus
} from "lucide-react";

import {
    StatsCard,
    UrgentTicketsList,
    RecentActivityFeed,
    RecentTicketsList,
    DashboardSkeleton,
    TicketTrendChart,
    CategoryDistributionChart,
    TeamPerformanceTable,
    AdminQuickActions,
    AgentQuickActions,
} from "@/components/dashboard";

// Component to handle access denied toast - wrapped in Suspense
function AccessDeniedHandler() {
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("access") === "denied") {
            toast.error("Anda tidak memiliki akses ke halaman tersebut");
            // Clean up URL without triggering navigation
            window.history.replaceState({}, "", "/admin");
        }
    }, [searchParams]);

    return null;
}

export default function AdminDashboardPage() {
    const { data, isLoading, error, refetch } = useDashboard();

    // Loading state
    if (isLoading) {
        return (
            <div className="flex-1 p-6">
                <PageHeader
                    title="Dashboard"
                    description="Ringkasan tiket dan aktivitas"
                />
                <DashboardSkeleton isAdmin />
            </div>
        );
    }

    // Error state
    if (error || !data) {
        return (
            <div className="flex-1 p-6">
                <PageHeader
                    title="Dashboard"
                    description="Ringkasan tiket dan aktivitas"
                />
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold mb-2">
                            Gagal memuat dashboard
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            {error || "Terjadi kesalahan saat memuat data"}
                        </p>
                        <Button onClick={() => refetch()} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Coba Lagi
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const isAdmin = data.isAdmin;

    return (
        <div className="flex-1 p-6">
            <Suspense fallback={null}>
                <AccessDeniedHandler />
            </Suspense>
            <PageHeader
                title="Dashboard"
                description="Ringkasan tiket dan aktivitas"
            />

            <div className="space-y-6">
                {/* ============================================ */}
                {/* STATS CARDS - Personal Stats untuk semua */}
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
                        description="Tiket aktif"
                        icon={Zap}
                        iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                        onClick={() => window.location.href = "/admin/tickets?status=in_progress&assigneeId=me"}
                    />
                    <StatsCard
                        title="Menunggu Info"
                        value={data.myStats.pending}
                        description="Perlu respons customer"
                        icon={Clock}
                        iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                        onClick={() => window.location.href = "/admin/tickets?status=pending&assigneeId=me"}
                    />
                    <StatsCard
                        title="Selesai Hari Ini"
                        value={data.myStats.resolvedToday}
                        description="Resolved hari ini"
                        icon={CheckCircle}
                        iconClassName="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    />
                </div>

                {/* ============================================ */}
                {/* ADMIN: Global Stats */}
                {/* ============================================ */}
                {isAdmin && data.globalStats && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Total Tiket"
                            value={data.globalStats.total}
                            description="Semua tiket"
                            icon={Ticket}
                            iconClassName="bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400"
                            onClick={() => window.location.href = "/admin/tickets"}
                        />
                        <StatsCard
                            title="Tiket Aktif"
                            value={data.globalStats.open + data.globalStats.inProgress + data.globalStats.pending}
                            description="Open + Proses + Pending"
                            icon={Zap}
                            iconClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
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
                )}

                {/* ============================================ */}
                {/* QUICK ACTIONS */}
                {/* ============================================ */}
                {isAdmin ? (
                    <AdminQuickActions
                        unassignedCount={data.globalStats?.unassigned}
                    />
                ) : (
                    <AgentQuickActions />
                )}

                {/* ============================================ */}
                {/* ADMIN: Charts Section */}
                {/* ============================================ */}
                {isAdmin && data.chartData && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <TicketTrendChart data={data.chartData.ticketsByDay} />
                        <CategoryDistributionChart data={data.chartData.ticketsByCategory} />
                    </div>
                )}

                {/* ============================================ */}
                {/* MAIN CONTENT GRID */}
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
                {/* ADMIN: Team Performance */}
                {/* ============================================ */}
                {isAdmin && data.teamPerformance && data.teamPerformance.length > 0 && (
                    <TeamPerformanceTable data={data.teamPerformance} />
                )}

                {/* ============================================ */}
                {/* RECENT TICKETS */}
                {/* ============================================ */}
                <RecentTicketsList
                    tickets={data.recentTickets}
                    title={isAdmin ? "Tiket Terbaru" : "Tiket Saya Terbaru"}
                    description={isAdmin
                        ? "Tiket terbaru yang memerlukan perhatian"
                        : "Tiket yang ditugaskan kepada Anda"
                    }
                    viewAllHref={isAdmin ? "/admin/tickets" : "/admin/tickets?assigneeId=me"}
                />
            </div>
        </div>
    );
}
