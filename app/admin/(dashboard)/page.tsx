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
    AdminDashboardView,
    AgentDashboardView,
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
                title={isAdmin ? "Executive Dashboard" : "My Dashboard"}
                description={isAdmin
                    ? "Overview performa tim dan status operasional"
                    : "Kelola tugas dan tiket harian Anda"
                }
            />

            {isAdmin ? (
                <AdminDashboardView data={data} />
            ) : (
                <AgentDashboardView data={data} />
            )}
        </div>
    );
}
