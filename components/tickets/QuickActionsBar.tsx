"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Play,
    CheckCircle,
    XCircle,
    Pause,
    ChevronUp,
    MoreHorizontal,
    UserPlus,
    Copy,
    Printer,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { SupportLevel } from "@/types/ticket";

interface QuickActionsBarProps {
    ticketNumber: string;
    status: string;
    level: SupportLevel;
    onStatusChange: (status: string) => void;
    onEscalate: () => void;
    onAssign?: () => void;
}

const statusWorkflows = {
    open: [
        { status: "in_progress", label: "Mulai Proses", icon: Play, variant: "default" as const },
    ],
    in_progress: [
        { status: "pending", label: "Pending", icon: Pause, variant: "outline" as const },
        { status: "resolved", label: "Selesaikan", icon: CheckCircle, variant: "default" as const },
    ],
    pending: [
        { status: "in_progress", label: "Lanjutkan", icon: Play, variant: "default" as const },
        { status: "resolved", label: "Selesaikan", icon: CheckCircle, variant: "outline" as const },
    ],
    resolved: [
        { status: "closed", label: "Tutup Tiket", icon: XCircle, variant: "default" as const },
        { status: "in_progress", label: "Buka Kembali", icon: Play, variant: "outline" as const },
    ],
    closed: [
        { status: "open", label: "Buka Kembali", icon: Play, variant: "outline" as const },
    ],
};

export function QuickActionsBar({
    ticketNumber,
    status,
    level,
    onStatusChange,
    onEscalate,
    onAssign,
}: QuickActionsBarProps) {
    const workflows = statusWorkflows[status as keyof typeof statusWorkflows] || [];

    const handleCopyTicketNumber = () => {
        navigator.clipboard.writeText(ticketNumber);
        toast.success("Nomor tiket disalin");
    };

    const handlePrint = () => {
        window.print();
    };

    // Get next level code for escalation
    const getNextLevelCode = () => {
        if (level.code === "L1") return "L2";
        if (level.code === "L2") return "L3";
        return null;
    };
    const nextLevelCode = getNextLevelCode();

    return (
        <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 flex-wrap">
                {/* Main workflow actions */}
                {workflows.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <Button
                            key={action.status}
                            variant={action.variant}
                            size="sm"
                            onClick={() => onStatusChange(action.status)}
                            className={cn(
                                "gap-2",
                                index === 0 && action.variant === "default" && "bg-primary hover:bg-primary/90"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {action.label}
                        </Button>
                    );
                })}

                {/* Escalate button */}
                {nextLevelCode && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onEscalate}
                        className="gap-2 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                    >
                        <ChevronUp className="h-4 w-4" />
                        Eskalasi ke {nextLevelCode}
                    </Button>
                )}

                {/* Assign button */}
                {onAssign && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAssign}
                        className="gap-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        Tugaskan
                    </Button>
                )}
            </div>

            {/* More actions dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu lainnya</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCopyTicketNumber}>
                        <Copy className="h-4 w-4 mr-2" />
                        Salin No. Tiket
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Cetak
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus Tiket
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

// Status indicator for quick reference
interface StatusIndicatorProps {
    status: string;
}

const statusStyles: Record<string, { label: string; className: string }> = {
    open: { label: "Menunggu", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    in_progress: { label: "Diproses", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    pending: { label: "Pending", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    resolved: { label: "Selesai", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    closed: { label: "Ditutup", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
    const style = statusStyles[status] || statusStyles.open;
    return (
        <Badge className={cn("text-xs", style.className)}>
            {style.label}
        </Badge>
    );
}

