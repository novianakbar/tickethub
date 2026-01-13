"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    statusOptions,
    priorityOptions,
    formatShortDate,
    getLevelClassName,
    type Ticket,
    type TicketStatus,
    type TicketPriority,
} from "@/lib/ticket-config";
import type { SupportLevel } from "@/types/ticket";

interface TicketSidebarProps {
    ticket: Ticket;
    status: TicketStatus;
    priority: TicketPriority;
    level: SupportLevel;
    levels?: SupportLevel[];
    onStatusChange: (value: TicketStatus) => void;
    onPriorityChange: (value: TicketPriority) => void;
    onLevelChange?: (levelId: string) => void;
}

export function TicketSidebar({
    ticket,
    status,
    priority,
    level,
    levels = [],
    onStatusChange,
    onPriorityChange,
    onLevelChange,
}: TicketSidebarProps) {
    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Level */}
                    <div className="space-y-2">
                        <Label>Level</Label>
                        {onLevelChange && levels.length > 0 ? (
                            <Select value={level.id} onValueChange={onLevelChange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {levels.map((opt) => (
                                        <SelectItem key={opt.id} value={opt.id}>
                                            {opt.code} - {opt.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Badge className={getLevelClassName(level.code)}>
                                {level.code} - {level.name}
                            </Badge>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={(v) => onStatusChange(v as TicketStatus)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label>Prioritas</Label>
                        <Select value={priority} onValueChange={(v) => onPriorityChange(v as TicketPriority)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {priorityOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Pelanggan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <p className="text-xs text-muted-foreground">Nama</p>
                        <p className="font-medium">{ticket.customerName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a
                            href={`mailto:${ticket.customerEmail}`}
                            className="font-medium text-primary hover:underline"
                        >
                            {ticket.customerEmail}
                        </a>
                    </div>
                    {ticket.customerPhone && (
                        <div>
                            <p className="text-xs text-muted-foreground">Telepon</p>
                            <a href={`tel:${ticket.customerPhone}`} className="font-medium">
                                {ticket.customerPhone}
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Ticket Details */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Detail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">ID Tiket</span>
                        <span className="font-mono">{ticket.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Kategori</span>
                        <span>{ticket.category}</span>
                    </div>
                    {ticket.assignee && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Assignee</span>
                            <span>{ticket.assignee}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Dibuat</span>
                        <span>{formatShortDate(ticket.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Diperbarui</span>
                        <span>{formatShortDate(ticket.updatedAt)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

