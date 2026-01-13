import { formatShortDate, type TimelineEvent } from "@/lib/ticket-config";
import {
    Plus,
    RefreshCw,
    TrendingUp,
    UserPlus,
    MessageSquare,
    FileText,
    CheckCircle,
    AlertTriangle,
    Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Support both the config-based events and API activity format
interface ActivityEvent {
    id: string;
    type: string;
    description: string;
    createdAt: string;
    author: {
        id: string;
        fullName: string | null;
        email: string;
    } | null;
}

interface TicketTimelineProps {
    events?: TimelineEvent[];
    activities?: ActivityEvent[];
}

type EventType = TimelineEvent["type"] | string;

function getEventStyle(type: EventType): string {
    switch (type) {
        case "created":
        case "create":
            return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
        case "update":
        case "priority_change":
            return "bg-primary/10 text-primary";
        case "status_change":
            return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
        case "level_change":
        case "escalate":
            return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
        case "assign":
        case "unassign":
            return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
        case "reply":
            return "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400";
        case "note":
            return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
        case "resolve":
            return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
        case "close":
            return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
        default:
            return "bg-muted text-muted-foreground";
    }
}

function getEventIcon(type: EventType) {
    const iconProps = { className: "h-3.5 w-3.5" };

    switch (type) {
        case "created":
        case "create":
            return <Plus {...iconProps} />;
        case "status_change":
        case "update":
            return <RefreshCw {...iconProps} />;
        case "level_change":
        case "escalate":
            return <TrendingUp {...iconProps} />;
        case "assign":
        case "unassign":
            return <UserPlus {...iconProps} />;
        case "reply":
            return <MessageSquare {...iconProps} />;
        case "note":
            return <FileText {...iconProps} />;
        case "resolve":
            return <CheckCircle {...iconProps} />;
        case "close":
            return <AlertTriangle {...iconProps} />;
        case "priority_change":
            return <Clock {...iconProps} />;
        default:
            return <RefreshCw {...iconProps} />;
    }
}

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function TicketTimeline({ events, activities }: TicketTimelineProps) {
    // Normalize data to a common format
    const timelineItems = activities
        ? activities.map((a) => ({
            id: a.id,
            type: a.type,
            message: a.description,
            author: a.author?.fullName || a.author?.email || "Sistem",
            timestamp: a.createdAt,
        }))
        : events
            ? events.map((e) => ({
                id: String(e.id),
                type: e.type,
                message: e.message,
                author: e.author || "Sistem",
                timestamp: e.timestamp,
            }))
            : [];

    if (timelineItems.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-center">
                <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                    Belum ada aktivitas
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {timelineItems.map((item, index) => (
                <div key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {/* Connecting Line */}
                    {index < timelineItems.length - 1 && (
                        <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-border" />
                    )}

                    {/* Icon */}
                    <div
                        className={cn(
                            "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                            getEventStyle(item.type)
                        )}
                    >
                        {getEventIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm leading-relaxed">
                                    <span className="font-medium">{item.author}</span>
                                    <span className="text-muted-foreground"> — </span>
                                    <span className="text-muted-foreground">{item.message}</span>
                                </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                {formatDateTime(item.timestamp)}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
