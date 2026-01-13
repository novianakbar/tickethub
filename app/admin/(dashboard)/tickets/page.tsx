"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Search,
    Loader2,
    Ticket,
    Filter,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    Pause,
    ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { getLevelClassName } from "@/lib/ticket-config";

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

const statusConfig = {
    open: { label: "Menunggu", icon: Clock, className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    in_progress: { label: "Diproses", icon: ArrowUpRight, className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    pending: { label: "Pending", icon: Pause, className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    resolved: { label: "Selesai", icon: CheckCircle, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    closed: { label: "Ditutup", icon: XCircle, className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
};

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

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState("all");
    const [page, setPage] = useState(1);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        pending: 0,
        resolved: 0,
    });

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", page.toString());
            params.set("limit", "20");
            if (search) params.set("search", search);
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (priorityFilter !== "all") params.set("priority", priorityFilter);
            if (levelFilter !== "all") params.set("level", levelFilter);

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
    }, [page, search, statusFilter, priorityFilter, levelFilter]);

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

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <>
            <AdminHeader
                title="Semua Tiket"
                description="Kelola dan tangani tiket support"
            />

            <div className="flex-1 overflow-auto p-6">
                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 sm:grid-cols-5">
                    <Card className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Menunggu</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Diproses</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Selesai</p>
                            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari tiket, pelanggan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[130px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="open">Menunggu</SelectItem>
                                        <SelectItem value="in_progress">Diproses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="resolved">Selesai</SelectItem>
                                        <SelectItem value="closed">Ditutup</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger className="w-[130px]">
                                        <SelectValue placeholder="Prioritas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Prioritas</SelectItem>
                                        <SelectItem value="urgent">Mendesak</SelectItem>
                                        <SelectItem value="high">Tinggi</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="low">Rendah</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={levelFilter} onValueChange={setLevelFilter}>
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="L1">L1</SelectItem>
                                        <SelectItem value="L2">L2</SelectItem>
                                        <SelectItem value="L3">L3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button asChild>
                                <Link href="/admin/tickets/new">
                                    <Plus className="h-4 w-4" />
                                    Buat Tiket
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tickets Table */}
                <Card>
                    {isLoading ? (
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
                            <Button asChild>
                                <Link href="/admin/tickets/new">
                                    <Plus className="h-4 w-4" />
                                    Buat Tiket Baru
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-28">No. Tiket</TableHead>
                                        <TableHead>Subjek</TableHead>
                                        <TableHead className="w-40">Pelanggan</TableHead>
                                        <TableHead className="w-28 text-center">Kategori</TableHead>
                                        <TableHead className="w-28 text-center">Status</TableHead>
                                        <TableHead className="w-20 text-center">Level</TableHead>
                                        <TableHead className="w-24 text-center">Prioritas</TableHead>
                                        <TableHead className="w-28">Waktu</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tickets.map((ticket) => {
                                        const StatusIcon = statusConfig[ticket.status].icon;
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
                                                    <Badge className={cn("text-xs gap-1", statusConfig[ticket.status].className)}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {statusConfig[ticket.status].label}
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
                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between border-t px-4 py-3">
                                    <p className="text-sm text-muted-foreground">
                                        Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} tiket)
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                            disabled={page === pagination.totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </div>
        </>
    );
}
