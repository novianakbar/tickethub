"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    MessageSquare,
    UserPlus,
    ArrowUpRight,
    CheckCircle,
    FileText,
    Clock,
    Zap
} from "lucide-react";
import type { ActivitySummary } from "@/types/dashboard";

interface RecentActivityFeedProps {
    activities: ActivitySummary[];
    className?: string;
}

const activityIcons: Record<string, typeof MessageSquare> = {
    created: FileText,
    reply: MessageSquare,
    note: FileText,
    status_change: Zap,
    assign: UserPlus,
    escalate: ArrowUpRight,
    resolved: CheckCircle,
    closed: CheckCircle,
};

const activityColors: Record<string, string> = {
    created: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    reply: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    note: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    status_change: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    assign: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    escalate: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    resolved: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    closed: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
};

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}h lalu`;
    if (diffHours > 0) return `${diffHours}j lalu`;
    if (diffMins > 0) return `${diffMins}m lalu`;
    return "Baru";
}

interface ActivityItemProps {
    activity: ActivitySummary;
}

function ActivityItem({ activity }: ActivityItemProps) {
    const Icon = activityIcons[activity.type] || FileText;
    const colorClass = activityColors[activity.type] || activityColors.created;

    return (
        <div className="flex gap-3 py-3 border-b last:border-0">
            <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                colorClass
            )}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-2">
                    {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="font-medium truncate">
                        {activity.author.fullName || activity.author.email}
                    </span>
                    <span>•</span>
                    <Link
                        href={`/admin/tickets/${activity.ticket.id}`}
                        className="font-mono hover:text-primary truncate"
                    >
                        {activity.ticket.ticketNumber}
                    </Link>
                    <span>•</span>
                    <span className="shrink-0">{formatTimeAgo(activity.createdAt)}</span>
                </div>
            </div>
        </div>
    );
}

export function RecentActivityFeed({
    activities,
    className,
}: RecentActivityFeedProps) {
    if (activities.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        Aktivitas Terbaru
                    </CardTitle>
                    <CardDescription>
                        Log aktivitas dari tiket Anda
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                            <Clock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Belum ada aktivitas
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
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Aktivitas Terbaru
                </CardTitle>
                <CardDescription>
                    Log aktivitas dari tiket Anda
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-0">
                    {activities.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
