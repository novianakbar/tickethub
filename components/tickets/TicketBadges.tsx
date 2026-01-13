import { Badge } from "@/components/ui/badge";
import {
    statusConfig,
    priorityConfig,
    getLevelClassName,
    type TicketStatus,
    type TicketPriority,
} from "@/lib/ticket-config";
import type { SupportLevel } from "@/types/ticket";

interface StatusBadgeProps {
    status: TicketStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
}

interface PriorityBadgeProps {
    priority: TicketPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
    const config = priorityConfig[priority];
    return <Badge className={config.className}>{config.label}</Badge>;
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

