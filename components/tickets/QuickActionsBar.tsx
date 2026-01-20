"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Play,
    CheckCircle,
    XCircle,
    Pause,
    ChevronUp,
    UserPlus,
    Copy,
    Printer,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import type { SupportLevel } from "@/types/ticket";
import { statusConfig } from "@/lib/ticket-config";

interface QuickActionsBarProps {
    ticketNumber: string;
    status: string;
    level: SupportLevel;
    onStatusChange: (status: string) => void;
    onEscalate: () => void;
    onAssign?: () => void;
    readOnly?: boolean;
}

const statusWorkflows = {
    open: [
        {
            status: "in_progress",
            label: "Mulai Proses",
            icon: Play,
            variant: "default" as const,
            // Blue theme for starting (Solid)
            className: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        },
    ],
    in_progress: [
        {
            status: "pending",
            label: "Tunggu Info",
            icon: Pause,
            variant: "secondary" as const,
            // Amber theme for waiting (Subtle)
            className: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 border-amber-200 dark:border-amber-800"
        },
        {
            status: "resolved",
            label: "Selesaikan",
            icon: CheckCircle,
            variant: "default" as const,
            // Emerald theme for success (Solid)
            className: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        },
    ],
    pending: [
        {
            status: "in_progress",
            label: "Lanjutkan",
            icon: Play,
            variant: "default" as const,
            // Blue theme for resuming (Solid)
            className: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        },
        {
            status: "resolved",
            label: "Selesaikan",
            icon: CheckCircle,
            variant: "secondary" as const,
            // Emerald theme for success (Subtle)
            className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800"
        },
    ],
    resolved: [
        {
            status: "closed",
            label: "Tutup Tiket",
            icon: XCircle,
            variant: "secondary" as const,
            // Slate theme for closing (Subtle)
            className: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
        },
        {
            status: "in_progress",
            label: "Buka Kembali",
            icon: Play,
            variant: "outline" as const,
            // Blue theme for reopening (Outline)
            className: "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
        },
    ],
    closed: [
        {
            status: "open",
            label: "Buka Kembali",
            icon: Play,
            variant: "outline" as const,
            // Blue theme for reopening (Outline)
            className: "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
        },
    ],
};

export function QuickActionsBar({
    ticketNumber,
    status,
    level,
    onStatusChange,
    onEscalate,
    onAssign,
    readOnly,
}: QuickActionsBarProps) {
    const { data: session } = useSession();
    const workflows = statusWorkflows[status as keyof typeof statusWorkflows] || [];

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        action: () => void;
        variant?: "default" | "destructive";
    }>({
        open: false,
        title: "",
        description: "",
        action: () => {},
        variant: "default",
    });

    // Check permissions
    const userRole = session?.user?.role;
    const userLevel = session?.user?.level;

    const canAssign = userRole === "admin" || userLevel?.canAssignTicket;
    const canEscalate = userRole === "admin" || userLevel?.canEscalateTicket;
    const canResolve = userRole === "admin" || userLevel?.canResolveTicket;
    const canClose = userRole === "admin" || userLevel?.canCloseTicket;

    const handleCopyTicketNumber = () => {
        navigator.clipboard.writeText(ticketNumber);
        toast.success("Nomor tiket disalin");
    };

    const handlePrint = () => {
        window.print();
    };

    // Handle status change with confirmation for important actions
    const handleStatusChangeWithConfirm = (newStatus: string) => {
        // Actions that need confirmation
        if (newStatus === "closed") {
            setConfirmDialog({
                open: true,
                title: "Tutup Tiket?",
                description: "Tiket akan ditutup dan tidak dapat menerima balasan baru dari pelanggan. Anda masih bisa membuka kembali tiket ini nanti.",
                action: () => onStatusChange(newStatus),
                variant: "default",
            });
        } else if (newStatus === "resolved") {
            setConfirmDialog({
                open: true,
                title: "Selesaikan Tiket?",
                description: "Tiket akan ditandai sebagai selesai. Pelanggan akan diberitahu bahwa masalah mereka telah ditangani.",
                action: () => onStatusChange(newStatus),
                variant: "default",
            });
        } else {
            // No confirmation needed for other status changes
            onStatusChange(newStatus);
        }
    };

    // Handle escalate with confirmation
    const handleEscalateWithConfirm = () => {
        const nextLevel = level.code === "L1" ? "L2" : "L3";
        setConfirmDialog({
            open: true,
            title: `Eskalasi ke ${nextLevel}?`,
            description: `Tiket akan dieskalasi dari ${level.code} ke ${nextLevel}. Tim ${nextLevel} akan mengambil alih penanganan tiket ini.`,
            action: onEscalate,
            variant: "default",
        });
    };

    // Get next level code for escalation
    const getNextLevelCode = () => {
        // Double check permission
        if (!canEscalate) return null;

        if (level.code === "L1") return "L2";
        if (level.code === "L2") return "L3";
        return null;
    };
    const nextLevelCode = getNextLevelCode();

    // Filter available workflow actions based on permissions
    const availableWorkflows = workflows.filter(action => {




        // Actually simplest way:
        if (action.status === "resolved" && !canResolve) return false;
        if (action.status === "closed" && !canClose) return false;



        return true;
    });

    // If readOnly (assigned to someone else), hide the entire bar
    if (readOnly) return null;

    return (
        <>
            <div className="flex items-center gap-2">
                {/* Main workflow actions */}
                {availableWorkflows.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Button
                            key={action.status}
                            variant={action.variant}
                            size="default"
                            onClick={() => handleStatusChangeWithConfirm(action.status)}
                            className={cn(
                                "h-10 px-4 font-medium transition-colors cursor-pointer",
                                action.className
                            )}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {action.label}
                        </Button>
                    );
                })}

                {/* Divider */}
                {(nextLevelCode || (onAssign && canAssign)) && (
                    <div className="h-6 w-px bg-border mx-2" />
                )}

                {/* Management Actions */}
                <div className="flex items-center gap-1">
                    {/* Escalate button */}
                    {nextLevelCode && (
                        <Button
                            variant="outline"
                            size="default"
                            onClick={handleEscalateWithConfirm}
                            className="h-10 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/30 cursor-pointer"
                        >
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Eskalasi ke {nextLevelCode}
                        </Button>
                    )}

                    {/* Assign button */}
                    {onAssign && canAssign && (
                        <Button
                            variant="ghost"
                            size="default"
                            onClick={onAssign}
                            className="h-10 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Tugaskan
                        </Button>
                    )}
                </div>

                {/* Divider before utilities */}
                <div className="h-6 w-px bg-border mx-1" />

                {/* Utilities */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={handleCopyTicketNumber}
                    title="Salin Nomor Tiket"
                >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Salin</span>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={handlePrint}
                    title="Cetak Tiket"
                >
                    <Printer className="h-4 w-4" />
                    <span className="sr-only">Cetak</span>
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Hapus Tiket"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Hapus</span>
                </Button>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog 
                open={confirmDialog.open} 
                onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialog.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                confirmDialog.action();
                                setConfirmDialog(prev => ({ ...prev, open: false }));
                            }}
                            className={cn(
                                confirmDialog.variant === "destructive" && 
                                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            )}
                        >
                            Ya, Lanjutkan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// Status indicator for quick reference
interface StatusIndicatorProps {
    status: string;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return (
        <Badge className={cn("text-xs", config.className)}>
            {config.label}
        </Badge>
    );
}
