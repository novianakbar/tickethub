"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Ticket, ChevronRight, ArrowRight } from "lucide-react";
import type { TicketSummary } from "@/types/dashboard";
import { statusConfig, priorityConfig } from "@/lib/ticket-config";

interface RecentTicketsListProps {
    tickets: TicketSummary[];
    title?: string;
    description?: string;
    showViewAll?: boolean;
    viewAllHref?: string;
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

interface TicketRowProps {
    ticket: TicketSummary;
}

function TicketRow({ ticket }: TicketRowProps) {
    return (
        <Link
            href={`/admin/tickets/${ticket.id}`}
            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-sm text-muted-foreground">
                        {ticket.ticketNumber}
                    </span>
                    <Badge className={cn("text-xs", statusConfig[ticket.status].className)}>
                        {statusConfig[ticket.status].label}
                    </Badge>
                    <Badge
                        variant="outline"
                        className={cn("text-xs", priorityConfig[ticket.priority].className)}
                    >
                        {priorityConfig[ticket.priority].label}
                    </Badge>
                </div>
                <p className="font-medium truncate">{ticket.subject}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {ticket.customerName} • {formatTimeAgo(ticket.createdAt)}
                </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground ml-2" />
        </Link>
    );
}

export function RecentTicketsList({
    tickets,
    title = "Tiket Terbaru",
    description = "Tiket yang baru masuk dan memerlukan perhatian",
    showViewAll = true,
    viewAllHref = "/admin/tickets",
    className,
}: RecentTicketsListProps) {
    if (tickets.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-muted-foreground" />
                        {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                            <Ticket className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Tidak ada tiket aktif
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-muted-foreground" />
                        {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                {showViewAll && (
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={viewAllHref} className="text-sm">
                            Lihat Semua
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {tickets.map((ticket) => (
                        <TicketRow key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
