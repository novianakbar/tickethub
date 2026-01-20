"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    User,
    Info,
    Check,
    ChevronsUpDown,
    UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import type { SupportLevel } from "@/types/ticket";

interface Agent {
    id: string;
    fullName: string | null;
    email: string;
    level?: {
        id: string;
        code: string;
        name: string;
    } | null;
}

interface TicketDetailSidebarProps {
    ticket: {
        id: string;
        ticketNumber: string;
        status: string;
        priority: string;
        level: SupportLevel;
        source: string;
        sourceNotes?: string | null;
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
    onAssigneeChange?: (assigneeId: string | null) => void;
    readOnly?: boolean;
}

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
    onAssigneeChange,
    readOnly,
}: TicketDetailSidebarProps) {
    const { data: session } = useSession();
    const userRole = session?.user?.role;
    const userLevel = session?.user?.level;
    const [comboboxOpen, setComboboxOpen] = useState(false);

    const canAssignment = userRole === "admin" || userLevel?.canAssignTicket;
    const currentAgent = agents.find((a) => a.id === ticket.assignee?.id);

    return (
        <div className="space-y-3">
            {/* Assignment Section */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Penugasan
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Ditangani oleh</Label>
                        {onAssigneeChange && agents.length > 0 && canAssignment && !readOnly ? (
                            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={comboboxOpen}
                                        className="w-full justify-between h-9 font-normal text-sm"
                                    >
                                        {currentAgent ? (
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="truncate">
                                                    {currentAgent.fullName || currentAgent.email}
                                                </span>
                                                {currentAgent.level && (
                                                    <Badge variant="outline" className="text-xs shrink-0">
                                                        {currentAgent.level.code}
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">Pilih agen...</span>
                                        )}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Cari agen..." />
                                        <CommandList>
                                            <CommandEmpty>Tidak ada agen ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                {/* Unassigned option */}
                                                <CommandItem
                                                    value="__unassigned__"
                                                    onSelect={() => {
                                                        onAssigneeChange(null);
                                                        setComboboxOpen(false);
                                                    }}
                                                >
                                                    <UserX className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Belum ditugaskan</span>
                                                    <Check
                                                        className={cn(
                                                            "ml-auto h-4 w-4",
                                                            !ticket.assignee?.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                                
                                                {/* Agent list */}
                                                {agents.map((agent) => (
                                                    <CommandItem
                                                        key={agent.id}
                                                        value={`${agent.fullName || ""} ${agent.email} ${agent.level?.code || ""}`}
                                                        onSelect={() => {
                                                            onAssigneeChange(agent.id);
                                                            setComboboxOpen(false);
                                                        }}
                                                    >
                                                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="truncate">
                                                                    {agent.fullName || agent.email}
                                                                </span>
                                                                {agent.level && (
                                                                    <Badge variant="outline" className="text-xs shrink-0">
                                                                        {agent.level.code}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {agent.fullName && (
                                                                <span className="text-xs text-muted-foreground truncate">
                                                                    {agent.email}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Check
                                                            className={cn(
                                                                "ml-auto h-4 w-4 shrink-0",
                                                                ticket.assignee?.id === agent.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
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
            </Card>

            {/* Details Section */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Detail Tiket
                    </CardTitle>
                </CardHeader>
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
                    {ticket.sourceNotes && (
                        <div className="space-y-1">
                            <span className="text-muted-foreground">Catatan Sumber</span>
                            <p className="text-xs bg-muted p-2 rounded">{ticket.sourceNotes}</p>
                        </div>
                    )}
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
            </Card>
        </div>
    );
}
