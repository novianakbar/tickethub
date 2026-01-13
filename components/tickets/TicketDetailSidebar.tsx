"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    ChevronDown,
    User,
    Clock,
    Settings,
    Info,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupportLevel } from "@/types/ticket";
import { getLevelClassName } from "@/lib/ticket-config";

interface Agent {
    id: string;
    fullName: string | null;
    email: string;
}

interface TicketDetailSidebarProps {
    ticket: {
        id: string;
        ticketNumber: string;
        status: string;
        priority: string;
        level: SupportLevel;
        source: string;
        dueDate?: string | null;
        createdAt: string;
        updatedAt: string;
        resolvedAt: string | null;
        closedAt: string | null;
        category: {
            id: string;
            name: string;
            color: string;
        };
        assignee: Agent | null;
        createdBy: Agent;
    };
    agents?: Agent[];
    onStatusChange: (status: string) => void;
    onPriorityChange: (priority: string) => void;
    onAssigneeChange?: (assigneeId: string | null) => void;
    onEscalate: () => void;
}

const statusOptions = [
    { value: "open", label: "Menunggu", color: "bg-blue-500" },
    { value: "in_progress", label: "Diproses", color: "bg-yellow-500" },
    { value: "pending", label: "Pending", color: "bg-orange-500" },
    { value: "resolved", label: "Selesai", color: "bg-green-500" },
    { value: "closed", label: "Ditutup", color: "bg-gray-500" },
];

const priorityOptions = [
    { value: "low", label: "Rendah", color: "text-gray-500" },
    { value: "normal", label: "Normal", color: "text-blue-500" },
    { value: "high", label: "Tinggi", color: "text-orange-500" },
    { value: "urgent", label: "Mendesak", color: "text-red-500" },
];

// Level config is now dynamic - get className from utility function

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} hari lalu`;
    if (hours > 0) return `${hours} jam lalu`;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return `${minutes} menit lalu`;
    return "Baru saja";
}

export function TicketDetailSidebar({
    ticket,
    agents = [],
    onStatusChange,
    onPriorityChange,
    onAssigneeChange,
    onEscalate,
}: TicketDetailSidebarProps) {
    const [openSections, setOpenSections] = useState({
        actions: true,
        assignment: true,
        details: false,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const levelClassName = getLevelClassName(ticket.level.code);
    const canEscalate = ticket.level.code !== "L3";

    return (
        <div className="space-y-3">
            {/* SLA Indicator */}
            <SLAIndicator
                createdAt={ticket.createdAt}
                status={ticket.status}
                resolvedAt={ticket.resolvedAt}
            />

            {/* Quick Actions Section */}
            <Card>
                <Collapsible open={openSections.actions} onOpenChange={() => toggleSection("actions")}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Aksi Cepat
                                </CardTitle>
                                <ChevronDown className={cn(
                                    "h-4 w-4 transition-transform",
                                    openSections.actions && "rotate-180"
                                )} />
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                            {/* Status */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Status</Label>
                                <Select value={ticket.status} onValueChange={onStatusChange}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("h-2 w-2 rounded-full", option.color)} />
                                                    {option.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Priority */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Prioritas</Label>
                                <Select value={ticket.priority} onValueChange={onPriorityChange}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorityOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                <span className={option.color}>{option.label}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Level & Escalate */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Level</Label>
                                <div className="flex items-center gap-2">
                                    <Badge className={cn("flex-1 justify-center", levelClassName)}>
                                        {ticket.level.code} - {ticket.level.name}
                                    </Badge>
                                    {canEscalate && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onEscalate}
                                            className="shrink-0"
                                        >
                                            Eskalasi
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Assignment Section */}
            <Card>
                <Collapsible open={openSections.assignment} onOpenChange={() => toggleSection("assignment")}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Penugasan
                                </CardTitle>
                                <ChevronDown className={cn(
                                    "h-4 w-4 transition-transform",
                                    openSections.assignment && "rotate-180"
                                )} />
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-3 pt-0">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Ditangani oleh</Label>
                                {onAssigneeChange && agents.length > 0 ? (
                                    <Select
                                        value={ticket.assignee?.id || "unassigned"}
                                        onValueChange={(v) => onAssigneeChange(v === "unassigned" ? null : v)}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Pilih agen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">
                                                <span className="text-muted-foreground">Belum ditugaskan</span>
                                            </SelectItem>
                                            {agents.map((agent) => (
                                                <SelectItem key={agent.id} value={agent.id}>
                                                    {agent.fullName || agent.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-sm font-medium">
                                        {ticket.assignee?.fullName || ticket.assignee?.email || (
                                            <span className="text-muted-foreground">Belum ditugaskan</span>
                                        )}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Dibuat oleh</Label>
                                <p className="text-sm">{ticket.createdBy.fullName || ticket.createdBy.email}</p>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Details Section */}
            <Card>
                <Collapsible open={openSections.details} onOpenChange={() => toggleSection("details")}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Detail Tiket
                                </CardTitle>
                                <ChevronDown className={cn(
                                    "h-4 w-4 transition-transform",
                                    openSections.details && "rotate-180"
                                )} />
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-2 pt-0 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Nomor Tiket</span>
                                <span className="font-mono text-xs">{ticket.ticketNumber}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Kategori</span>
                                <Badge
                                    variant="outline"
                                    style={{ borderColor: ticket.category.color, color: ticket.category.color }}
                                >
                                    {ticket.category.name}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Sumber</span>
                                <span className="capitalize">{ticket.source.replace("_", " ")}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Dibuat</span>
                                <span className="text-xs">{formatDateTime(ticket.createdAt)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Diperbarui</span>
                                <span className="text-xs">{formatRelativeTime(ticket.updatedAt)}</span>
                            </div>
                            {ticket.resolvedAt && (
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Diselesaikan</span>
                                    <span className="text-xs">{formatDateTime(ticket.resolvedAt)}</span>
                                </div>
                            )}
                            {ticket.closedAt && (
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Ditutup</span>
                                    <span className="text-xs">{formatDateTime(ticket.closedAt)}</span>
                                </div>
                            )}
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        </div>
    );
}

// SLA Indicator Component
interface SLAIndicatorProps {
    createdAt: string;
    status: string;
    resolvedAt: string | null;
}

function SLAIndicator({ createdAt, status, resolvedAt }: SLAIndicatorProps) {
    const created = new Date(createdAt);
    const now = new Date();
    const resolved = resolvedAt ? new Date(resolvedAt) : null;

    // Calculate elapsed time
    const endTime = resolved || now;
    const elapsedMs = endTime.getTime() - created.getTime();
    const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const elapsedDays = Math.floor(elapsedHours / 24);
    const remainingHours = elapsedHours % 24;

    // SLA thresholds (in hours) - can be configured
    const slaWarning = 24; // 24 hours
    const slaCritical = 48; // 48 hours

    const isResolved = status === "resolved" || status === "closed";
    const isWarning = !isResolved && elapsedHours >= slaWarning && elapsedHours < slaCritical;
    const isCritical = !isResolved && elapsedHours >= slaCritical;

    // Progress percentage (based on 48h target)
    const progressPercent = Math.min((elapsedHours / slaCritical) * 100, 100);

    let statusColor = "bg-green-500";
    let statusBg = "bg-green-100 dark:bg-green-900/30";
    let statusText = "text-green-700 dark:text-green-400";
    let StatusIcon = CheckCircle2;

    if (isResolved) {
        statusColor = "bg-green-500";
        statusBg = "bg-green-100 dark:bg-green-900/30";
        statusText = "text-green-700 dark:text-green-400";
    } else if (isCritical) {
        statusColor = "bg-red-500";
        statusBg = "bg-red-100 dark:bg-red-900/30";
        statusText = "text-red-700 dark:text-red-400";
        StatusIcon = AlertTriangle;
    } else if (isWarning) {
        statusColor = "bg-yellow-500";
        statusBg = "bg-yellow-100 dark:bg-yellow-900/30";
        statusText = "text-yellow-700 dark:text-yellow-400";
        StatusIcon = Clock;
    }

    const elapsedText = elapsedDays > 0
        ? `${elapsedDays}h ${remainingHours}j`
        : `${elapsedHours} jam`;

    return (
        <Card className={cn("border-l-4", isResolved ? "border-l-green-500" : isCritical ? "border-l-red-500" : isWarning ? "border-l-yellow-500" : "border-l-blue-500")}>
            <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium">Waktu Berjalan</span>
                    </div>
                    <Badge variant="secondary" className={cn("text-xs", statusBg, statusText)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {isResolved ? "Selesai" : isCritical ? "Kritis" : isWarning ? "Perhatian" : "Normal"}
                    </Badge>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-semibold">{elapsedText}</span>
                        <span className="text-muted-foreground text-xs">target: 48j</span>
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
