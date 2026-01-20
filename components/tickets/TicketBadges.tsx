import { Badge } from "@/components/ui/badge";
import {
    statusConfig,
    priorityConfig,
    getLevelClassName,
    type TicketStatus,
    type TicketPriority,
} from "@/lib/ticket-config";
import type { SupportLevel } from "@/types/ticket";
import {
    Circle,
    Play,
    Pause,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Minus,
    ChevronUp,
} from "lucide-react";

// Status icons for accessibility (not just color-dependent)
const statusIcons: Record<TicketStatus, React.ElementType> = {
    open: Circle,
    in_progress: Play,
    pending: Pause,
    resolved: CheckCircle,
    closed: XCircle,
};

// Priority icons for accessibility
const priorityIcons: Record<TicketPriority, React.ElementType> = {
    low: Minus,
    normal: Circle,
    high: ChevronUp,
    urgent: AlertTriangle,
};

interface StatusBadgeProps {
    status: TicketStatus;
    showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
    const config = statusConfig[status];
    const Icon = statusIcons[status];
    return (
        <Badge className={config.className}>
            {showIcon && <Icon className="h-3 w-3 mr-1" />}
            {config.label}
        </Badge>
    );
}

interface PriorityBadgeProps {
    priority: TicketPriority;
    showIcon?: boolean;
}

export function PriorityBadge({ priority, showIcon = true }: PriorityBadgeProps) {
    const config = priorityConfig[priority];
    const Icon = priorityIcons[priority];
    return (
        <Badge className={config.className}>
            {showIcon && <Icon className="h-3 w-3 mr-1" />}
            {config.label}
        </Badge>
    );
}

interface LevelBadgeProps {
    level: SupportLevel;
    showName?: boolean;
}

export function LevelBadge({ level, showName = false }: LevelBadgeProps) {
    const className = getLevelClassName(level.code);
    return (
        <Badge className={className}>
            {showName ? `${level.code} - ${level.name}` : level.code}
        </Badge>
    );
}

interface TicketBadgesProps {
    status: TicketStatus;
    priority: TicketPriority;
    level: SupportLevel;
}

export function TicketBadges({ status, priority, level }: TicketBadgesProps) {
    return (
        <div className="flex items-center gap-1.5">
            <LevelBadge level={level} />
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
        </div>
    );
}

