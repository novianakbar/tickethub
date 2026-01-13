"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, PriorityBadge, LevelBadge } from "./TicketBadges";
import { cn } from "@/lib/utils";
import { type Ticket } from "@/lib/ticket-config";
import { timeAgo, getInitials, isUrgent } from "@/lib/time-utils";

interface TicketCardProps {
    ticket: Ticket;
    href?: string;
}

// Level border colors
const levelBorderColors: Record<string, string> = {
    L1: "border-l-blue-500",
    L2: "border-l-orange-500",
    L3: "border-l-purple-600",
};

export function TicketCard({ ticket, href }: TicketCardProps) {
    const urgent = isUrgent(ticket.updatedAt, 24) && ticket.status !== "closed" && ticket.status !== "resolved";
    const initials = getInitials(ticket.customerName);
    const levelCode = ticket.level?.code ?? "L1";
    const borderColor = levelBorderColors[levelCode] || "border-l-gray-400";

    const content = (
        <Card
            className={cn(
                "border-l-4 transition-all duration-200",
                borderColor,
                "hover:shadow-md hover:bg-muted/30",
                urgent && "ring-1 ring-red-200 dark:ring-red-900/50"
            )}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {/* Customer Avatar */}
                    <div
                        className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                            "bg-primary/10 text-primary"
                        )}
                    >
                        {initials}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Top Row: Subject + Badges */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium leading-tight truncate">
                                    {ticket.subject}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                                <LevelBadge level={ticket.level} />
                                <StatusBadge status={ticket.status} />
                            </div>
                        </div>

                        {/* Middle Row: Customer + Category */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span className="font-medium text-foreground">
                                {ticket.customerName}
                            </span>
                            <span>•</span>
                            <span>{ticket.category}</span>
                            <span>•</span>
                            <span className="font-mono text-xs">{ticket.id}</span>
                        </div>

                        {/* Bottom Row: Priority + Time + Assignee */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PriorityBadge priority={ticket.priority} />
                                {ticket.assignee && (
                                    <span className="text-xs text-muted-foreground">
                                        → {ticket.assignee}
                                    </span>
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-xs",
                                    urgent ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"
                                )}
                            >
                                {urgent && "⚠ "}
                                {timeAgo(ticket.updatedAt)}
                            </span>
                        </div>
                    </div>

                    {/* Arrow */}
                    {href && (
                        <svg
                            className="h-5 w-5 shrink-0 text-muted-foreground/50 self-center"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block group">
                {content}
            </Link>
        );
    }

    return content;
}

