import Link from "next/link";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Mock data
const stats = [
    {
        title: "Total Tiket",
        value: "248",
        description: "Semua tiket",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
        ),
    },
    {
        title: "Menunggu",
        value: "42",
        description: "Belum diproses",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        title: "Diproses",
        value: "18",
        description: "Sedang dikerjakan",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    {
        title: "Selesai",
        value: "188",
        description: "Sudah ditutup",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

const recentTickets = [
    {
        id: "TKT-M4X7K2P9",
        subject: "Permintaan reset password",
        status: "in_progress",
        priority: "high",
        customer: "Budi Santoso",
        createdAt: "2024-12-23T10:30:00Z",
    },
    {
        id: "TKT-N5Y8L3Q0",
        subject: "Pembayaran tidak tercatat",
        status: "open",
        priority: "high",
        customer: "Siti Aminah",
        createdAt: "2024-12-23T09:15:00Z",
    },
    {
        id: "TKT-O6Z9M4R1",
        subject: "Kendala akses aplikasi",
        status: "open",
        priority: "medium",
        customer: "Ahmad Wijaya",
        createdAt: "2024-12-23T08:45:00Z",
    },
    {
        id: "TKT-P7A0N5S2",
        subject: "Perubahan data pelanggan",
        status: "resolved",
        priority: "low",
        customer: "Dewi Lestari",
        createdAt: "2024-12-22T16:20:00Z",
    },
];

const statusConfig: Record<string, { label: string; className: string }> = {
    open: {
        label: "Menunggu",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    in_progress: {
        label: "Diproses",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    resolved: {
        label: "Selesai",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    closed: {
        label: "Ditutup",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
    low: {
        label: "Normal",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    medium: {
        label: "Sedang",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    high: {
        label: "Prioritas",
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
};

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AdminDashboardPage() {
    return (
        <>
            <AdminHeader
                title="Dashboard"
                description="Ringkasan tiket dan aktivitas"
            />

            <div className="flex-1 overflow-auto p-6">
                {/* Stats Grid */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.title}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        {stat.icon}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-6 flex gap-3">
                    <Button asChild>
                        <Link href="/admin/tickets/new">
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Buat Tiket Baru
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/tickets">
                            Lihat Semua Tiket
                        </Link>
                    </Button>
                </div>

                {/* Recent Tickets */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tiket Terbaru</CardTitle>
                        <CardDescription>
                            Tiket yang baru masuk dan memerlukan perhatian
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentTickets.map((ticket) => (
                                <Link
                                    key={ticket.id}
                                    href={`/admin/tickets/${ticket.id}`}
                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-sm text-muted-foreground">
                                                {ticket.id}
                                            </span>
                                            <Badge className={statusConfig[ticket.status].className}>
                                                {statusConfig[ticket.status].label}
                                            </Badge>
                                            <Badge className={priorityConfig[ticket.priority].className}>
                                                {priorityConfig[ticket.priority].label}
                                            </Badge>
                                        </div>
                                        <p className="font-medium truncate">{ticket.subject}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {ticket.customer} • {formatDate(ticket.createdAt)}
                                        </p>
                                    </div>
                                    <svg
                                        className="h-5 w-5 shrink-0 text-muted-foreground"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
