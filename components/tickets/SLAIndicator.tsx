"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SLAIndicatorProps {
    createdAt: string;
    dueDate?: string | null;
    status: string;
    resolvedAt: string | null;
    variant?: "card" | "inline";
}

export function SLAIndicator({ 
    createdAt, 
    dueDate, 
    status, 
    resolvedAt,
    variant = "card" 
}: SLAIndicatorProps) {
    const created = new Date(createdAt);
    const now = new Date();
    const resolved = resolvedAt ? new Date(resolvedAt) : null;

    // Calculate elapsed time
    const endTime = resolved || now;
    const elapsedMs = endTime.getTime() - created.getTime();
    const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const elapsedDays = Math.floor(elapsedHours / 24);
    const remainingHours = elapsedHours % 24;

    // Calculate target from dueDate or fallback to 48h default
    let targetHours = 48; // Default fallback
    let targetDisplay = "48j";

    if (dueDate) {
        const due = new Date(dueDate);
        const targetMs = due.getTime() - created.getTime();
        targetHours = Math.max(1, Math.floor(targetMs / (1000 * 60 * 60)));
        targetDisplay = targetHours >= 24
            ? `${Math.floor(targetHours / 24)}h ${targetHours % 24}j`
            : `${targetHours}j`;
    }

    // SLA thresholds based on target
    const slaWarning = Math.floor(targetHours * 0.75); // 75% of target
    const slaCritical = targetHours; // 100% of target

    const isResolved = status === "resolved" || status === "closed";
    const isWarning = !isResolved && elapsedHours >= slaWarning && elapsedHours < slaCritical;
    const isCritical = !isResolved && elapsedHours >= slaCritical;

    // Progress percentage based on target
    const progressPercent = Math.min((elapsedHours / targetHours) * 100, 100);

    let statusColor = "bg-blue-500";
    let statusBg = "bg-blue-100 dark:bg-blue-900/30";
    let statusText = "text-blue-700 dark:text-blue-400";
    let StatusIcon = Clock;
    let statusLabel = "Normal";

    if (isResolved) {
        statusColor = "bg-green-500";
        statusBg = "bg-green-100 dark:bg-green-900/30";
        statusText = "text-green-700 dark:text-green-400";
        StatusIcon = CheckCircle2;
        statusLabel = "Selesai";
    } else if (isCritical) {
        statusColor = "bg-red-500";
        statusBg = "bg-red-100 dark:bg-red-900/30";
        statusText = "text-red-700 dark:text-red-400";
        StatusIcon = AlertTriangle;
        statusLabel = "Kritis";
    } else if (isWarning) {
        statusColor = "bg-yellow-500";
        statusBg = "bg-yellow-100 dark:bg-yellow-900/30";
        statusText = "text-yellow-700 dark:text-yellow-400";
        StatusIcon = Clock;
        statusLabel = "Perhatian";
    }

    const elapsedText = elapsedDays > 0
        ? `${elapsedDays}h ${remainingHours}j`
        : `${elapsedHours} jam`;

    const borderColor = isResolved 
        ? "border-l-green-500" 
        : isCritical 
            ? "border-l-red-500" 
            : isWarning 
                ? "border-l-yellow-500" 
                : "border-l-blue-500";

    // Inline variant for prominent display
    if (variant === "inline") {
        return (
            <div className={cn(
                "flex items-center gap-4 p-3 rounded-lg border-l-4",
                borderColor,
                statusBg
            )}>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">SLA:</span>
                    <span className="text-sm font-semibold">{elapsedText}</span>
                    <span className="text-xs text-muted-foreground">/ {targetDisplay}</span>
                </div>
                
                {/* Progress Bar */}
                {!isResolved && (
                    <div className="flex-1 max-w-xs">
                        <div className="h-2 rounded-full bg-background/50 overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all", statusColor)}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}
                
                <Badge variant="secondary" className={cn("text-xs shrink-0", statusBg, statusText)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusLabel}
                </Badge>
            </div>
        );
    }

    // Card variant (original)
    return (
        <Card className={cn("border-l-4", borderColor)}>
            <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium">Waktu Berjalan</span>
                    </div>
                    <Badge variant="secondary" className={cn("text-xs", statusBg, statusText)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusLabel}
                    </Badge>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-semibold">{elapsedText}</span>
                        <span className="text-muted-foreground text-xs">target: {targetDisplay}</span>
                    </div>

                    {/* Progress Bar */}
                    {!isResolved && (
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all", statusColor)}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
