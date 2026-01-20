"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
    Plus,
    Loader2,
    Ticket,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    Pause,
    ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { getLevelClassName, statusConfig as globalStatusConfig } from "@/lib/ticket-config";
import { useTicketFilters } from "@/hooks/useTicketFilters";
import { TicketFilterToolbar } from "@/components/tickets/TicketFilterToolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

interface TicketData {
    id: string;
    ticketNumber: string;
    subject: string;
    status: "open" | "in_progress" | "pending" | "resolved" | "closed";
    priority: "low" | "normal" | "high" | "urgent";
    level: {
        id: string;
        code: string;
        name: string;
    };
    customerName: string;
    customerEmail: string;
    createdAt: string;
    updatedAt: string;
    category: {
        id: string;
        name: string;
        color: string;
    };
    assignee: {
        id: string;
        fullName: string | null;
        email: string;
    } | null;
    _count: {
        replies: number;
        attachments: number;
    };
}

interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const statusIcons = {
    open: Clock,
    in_progress: ArrowUpRight,
    pending: Pause,
    resolved: CheckCircle,
    closed: XCircle,
} as const;

const priorityConfig = {
    low: { label: "Rendah", className: "text-gray-500" },
    normal: { label: "Normal", className: "text-blue-500" },
    high: { label: "Tinggi", className: "text-orange-500" },
    urgent: { label: "Mendesak", className: "text-red-500 font-semibold" },
};

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Baru saja";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;

    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function AdminTicketsContent() {
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Metadata for filters
    const [levels, setLevels] = useState<{ id: string; code: string; name: string }[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string; color: string }[]>([]);

    // Use our new custom hook for filters
    const { filters, setPage, setLimit } = useTicketFilters();

    const { data: session } = useSession();
    const userRole = session?.user?.role;
    const userLevel = session?.user?.level;
    const canCreate = userRole === "admin" || userLevel?.canCreateTicket;

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        pending: 0,
        resolved: 0,
    });

    // Load filter options (Levels, Categories) only once
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // Fetch Categories
                const catRes = await fetch("/api/categories");
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData.categories || []);
                }

                // Fetch Support Levels
                const levelRes = await fetch("/api/support-levels");
                if (levelRes.ok) {
                    const levelData = await levelRes.json();
                    // Assuming API returns array or { levels: [] }
                    // Based on typical implementation, it might differ. 
                    // Let's assume array for now, or check response if needed.
                    // If the API follows standard pattern it might need .data or similar.
                    // For now, assume array as per other endpoints.
                    if (Array.isArray(levelData)) {
                        setLevels(levelData);
                    } else if (levelData.levels) {
                        setLevels(levelData.levels);
                    } else {
                        setLevels(levelData); // fallback
                    }
                }
            } catch (e) {
                console.error("Failed to load filter options", e);
            }
        };
        fetchOptions();
    }, []);


    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", filters.page.toString());
            params.set("limit", filters.limit.toString());

            if (filters.search) params.set("search", filters.search);
            if (filters.status !== "all") params.set("status", filters.status);
            if (filters.priority !== "all") params.set("priority", filters.priority);
            if (filters.level !== "all") params.set("levelId", filters.level); // Note: API expects levelId
            if (filters.categoryId !== "all") params.set("categoryId", filters.categoryId);
            if (filters.assigneeId !== "all") params.set("assigneeId", filters.assigneeId);

            const res = await fetch(`/api/tickets?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setTickets(data.tickets);
                setPagination(data.pagination);
            } else {
                toast.error("Gagal memuat tiket");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    // Fetch stats separately (without filters)
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch("/api/tickets?limit=1000");
            if (res.ok) {
                const data = await res.json();
                const allTickets = data.tickets as TicketData[];
                setStats({
                    total: allTickets.length,
                    open: allTickets.filter(t => t.status === "open").length,
                    inProgress: allTickets.filter(t => t.status === "in_progress").length,
                    pending: allTickets.filter(t => t.status === "pending").length,
                    resolved: allTickets.filter(t => t.status === "resolved").length,
                });
            }
        } catch (error) {
            console.error("Stats fetch error:", error);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return (
        <div className="flex-1 p-6">
            <PageHeader
                title="Manajemen Tiket"
                description="Kelola semua tiket support"
            />
            {/* Stats Cards */}
            <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-5">
                <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{globalStatusConfig.open.label}</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{globalStatusConfig.in_progress.label}</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{globalStatusConfig.pending.label}</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{globalStatusConfig.resolved.label}</p>
                        <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Filter Toolbar */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold">Filter & Pencarian</h3>
                        {canCreate && (
                            <Button asChild size="sm">
                                <Link href="/admin/tickets/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Buat Tiket
                                </Link>
                            </Button>
                        )}
                    </div>
                    <TicketFilterToolbar levels={levels} categories={categories} />
                </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card>
                {tickets.length === 0 && isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Ticket className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-1 font-semibold">Tidak ada tiket</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Belum ada tiket yang sesuai dengan filter
                        </p>
                        {canCreate && (
                            <Button asChild>
                                <Link href="/admin/tickets/new">
                                    <Plus className="h-4 w-4" />
                                    Buat Tiket Baru
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className={cn("transition-opacity duration-200", isLoading && "opacity-50 pointer-events-none")}>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-28">No. Tiket</TableHead>
                                    <TableHead>Subjek</TableHead>
                                    <TableHead className="w-40">Pelanggan</TableHead>
                                    <TableHead className="w-28 text-center">Kategori</TableHead>
                                    <TableHead className="w-32 text-center">Agent</TableHead>
                                    <TableHead className="w-28 text-center">Status</TableHead>
                                    <TableHead className="w-20 text-center">Level</TableHead>
                                    <TableHead className="w-24 text-center">Prioritas</TableHead>
                                    <TableHead className="w-28">Waktu</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((ticket) => {
                                    const StatusIcon = statusIcons[ticket.status as keyof typeof statusIcons];
                                    const statusConf = globalStatusConfig[ticket.status as keyof typeof globalStatusConfig];
                                    return (
                                        <TableRow
                                            key={ticket.id}
                                            className={cn(
                                                "group cursor-pointer hover:bg-muted/50 transition-colors",
                                                ticket.priority === "urgent" && "bg-red-50/50 dark:bg-red-900/10"
                                            )}
                                        >
                                            <TableCell>
                                                <Link
                                                    href={`/admin/tickets/${ticket.id}`}
                                                    className="font-mono text-sm text-primary hover:underline"
                                                >
                                                    {ticket.ticketNumber}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/tickets/${ticket.id}`}
                                                    className="block group-hover:text-primary"
                                                >
                                                    <p className="font-medium line-clamp-1">{ticket.subject}</p>
                                                    {ticket._count.replies > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {ticket._count.replies} balasan
                                                        </p>
                                                    )}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-sm">{ticket.customerName}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                        {ticket.customerEmail}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                    style={{
                                                        borderColor: ticket.category.color,
                                                        color: ticket.category.color,
                                                    }}
                                                >
                                                    {ticket.category.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {ticket.assignee ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-medium">{ticket.assignee.fullName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={cn("text-xs gap-1", statusConf.className)}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusConf.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className={cn("text-xs", getLevelClassName(ticket.level?.code ?? "L1"))}>
                                                    {ticket.level?.code ?? "L1"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={cn("text-sm", priorityConfig[ticket.priority].className)}>
                                                    {ticket.priority === "urgent" && <AlertCircle className="h-3 w-3 inline mr-1" />}
                                                    {priorityConfig[ticket.priority].label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatTimeAgo(ticket.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {pagination && (
                            <div className="border-t p-4">
                                <DataTablePagination
                                    pageIndex={pagination.page}
                                    pageSize={pagination.limit}
                                    rowCount={pagination.total}
                                    pageCount={pagination.totalPages}
                                    onPageChange={setPage}
                                    onPageSizeChange={setLimit}
                                />
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}

export default function AdminTicketsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <AdminTicketsContent />
        </Suspense>
    );
}
