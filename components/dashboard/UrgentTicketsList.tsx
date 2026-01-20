"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, ChevronRight } from "lucide-react";
import type { TicketSummary } from "@/types/dashboard";
import { statusConfig, priorityConfig } from "@/lib/ticket-config";

interface UrgentTicketsListProps {
    urgentTickets: TicketSummary[];
    overdueTickets: TicketSummary[];
    className?: string;
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} hari lalu`;
    if (diffHours > 0) return `${diffHours} jam lalu`;
    if (diffMins > 0) return `${diffMins} menit lalu`;
    return "Baru saja";
}

function formatDueDate(dateString: string | null): string | null {
    if (!dateString) return null;

    const dueDate = new Date(dateString);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
        // Overdue
        const overdueDays = Math.abs(diffDays);
        const overdueHours = Math.abs(diffHours) % 24;
        if (overdueDays > 0) return `Terlambat ${overdueDays} hari`;
        return `Terlambat ${overdueHours} jam`;
    }

    if (diffDays === 0) return `Jatuh tempo dalam ${diffHours} jam`;
    return `Jatuh tempo dalam ${diffDays} hari`;
}

interface TicketItemProps {
    ticket: TicketSummary;
    showDueDate?: boolean;
}

function TicketItem({ ticket, showDueDate }: TicketItemProps) {
    const dueText = showDueDate ? formatDueDate(ticket.dueDate) : null;
    const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date();

    return (
        <Link
            href={`/admin/tickets/${ticket.id}`}
            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
        >
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">
                        {ticket.ticketNumber}
                    </span>
                    <Badge
                        variant="outline"
                        className={cn("text-xs", statusConfig[ticket.status].className)}
                    >
                        {statusConfig[ticket.status].label}
                    </Badge>
                    <Badge
                        variant="outline"
                        className={cn("text-xs", priorityConfig[ticket.priority].className)}
                    >
                        {priorityConfig[ticket.priority].label}
                    </Badge>
                </div>
                <p className="font-medium text-sm truncate">{ticket.subject}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{ticket.customerName}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(ticket.createdAt)}</span>
                    {dueText && (
                        <>
                            <span>•</span>
                            <span className={cn(
                                "flex items-center gap-1",
                                isOverdue && "text-red-600 dark:text-red-400 font-medium"
                            )}>
                                {isOverdue && <AlertTriangle className="h-3 w-3" />}
                                {dueText}
                            </span>
                        </>
                    )}
                </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
    );
}

export function UrgentTicketsList({
    urgentTickets,
    overdueTickets,
    className,
}: UrgentTicketsListProps) {
    const hasUrgent = urgentTickets.length > 0;
    const hasOverdue = overdueTickets.length > 0;

    if (!hasUrgent && !hasOverdue) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Tiket Memerlukan Perhatian
                    </CardTitle>
                    <CardDescription>
                        Tiket dengan prioritas tinggi atau melewati tenggat waktu
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
                            <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="font-medium text-green-600 dark:text-green-400">
                            Semua tiket terkendali!
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Tidak ada tiket urgent atau overdue saat ini
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Tiket Memerlukan Perhatian
                </CardTitle>
                <CardDescription>
                    Tiket dengan prioritas tinggi atau melewati tenggat waktu
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Overdue Section */}
                {hasOverdue && (
                    <div>
                        <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            Overdue ({overdueTickets.length})
                        </h4>
                        <div className="space-y-2">
                            {overdueTickets.map((ticket) => (
                                <TicketItem
                                    key={ticket.id}
                                    ticket={ticket}
                                    showDueDate
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Urgent Section */}
                {hasUrgent && (
                    <div>
                        <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                            Prioritas Tinggi ({urgentTickets.length})
                        </h4>
                        <div className="space-y-2">
                            {urgentTickets.map((ticket) => (
                                <TicketItem key={ticket.id} ticket={ticket} />
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
