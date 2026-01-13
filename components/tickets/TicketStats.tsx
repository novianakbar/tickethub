"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/lib/ticket-config";

interface TicketStatsProps {
    tickets: Ticket[];
}

interface StatItem {
    key: string;
    label: string;
    count: number;
    color: string;
    bgColor: string;
}

export function TicketStats({ tickets }: TicketStatsProps) {
    const stats: StatItem[] = [
        {
            key: "open",
            label: "Menunggu",
            count: tickets.filter((t) => t.status === "open").length,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
            key: "in_progress",
            label: "Diproses",
            count: tickets.filter((t) => t.status === "in_progress").length,
            color: "text-yellow-600 dark:text-yellow-400",
            bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        },
        {
            key: "resolved",
            label: "Selesai",
            count: tickets.filter((t) => t.status === "resolved").length,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-100 dark:bg-green-900/30",
        },
        {
            key: "closed",
            label: "Ditutup",
            count: tickets.filter((t) => t.status === "closed").length,
            color: "text-gray-600 dark:text-gray-400",
            bgColor: "bg-gray-100 dark:bg-gray-800",
        },
    ];

    const totalTickets = tickets.length;
    const urgentTickets = tickets.filter(
        (t) => t.priority === "high" && t.status !== "closed" && t.status !== "resolved"
    ).length;

    return (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Total */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">{totalTickets}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                    </div>
                    {urgentTickets > 0 && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                            ⚠ {urgentTickets} tiket prioritas tinggi
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Status Stats */}
            {stats.map((stat) => (
                <Card key={stat.key}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className={cn("text-2xl font-bold", stat.color)}>
                                    {stat.count}
                                </p>
                            </div>
                            <div
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg",
                                    stat.bgColor
                                )}
                            >
                                <span className={cn("text-lg font-bold", stat.color)}>
                                    {stat.count}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
