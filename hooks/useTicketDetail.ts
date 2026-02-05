"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { TicketDetail, PendingAttachment } from "@/types/ticket";

interface UseTicketDetailOptions {
    ticketId: string;
}

interface UseTicketDetailReturn {
    ticket: TicketDetail | null;
    isLoading: boolean;
    isSubmitting: boolean;
    refetch: () => Promise<void>;
    handleStatusChange: (newStatus: string) => Promise<void>;
    handlePriorityChange: (newPriority: string) => Promise<void>;
    handleEscalate: () => Promise<boolean>;
    handleAssigneeChange: (assigneeId: string | null, note?: string) => Promise<boolean>;
    handleSendReply: (message: string, attachments?: PendingAttachment[]) => Promise<boolean>;
    handleAddNote: (content: string, attachments?: PendingAttachment[]) => Promise<boolean>;
    handleUploadAttachments: (files: PendingAttachment[]) => Promise<boolean>;
    handleDeleteAttachment: (attachmentId: string) => Promise<boolean>;
}

export function useTicketDetail({ ticketId }: UseTicketDetailOptions): UseTicketDetailReturn {
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const refetch = useCallback(async () => {
        try {
            const res = await fetch(`/api/tickets/${ticketId}`);
            if (res.ok) {
                const data = await res.json();
                setTicket(data.ticket);
            } else {
                toast.error("Gagal memuat tiket");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleStatusChange = useCallback(async (newStatus: string) => {
        if (!ticket) return;

        const statusLabels: Record<string, string> = {
            open: "Baru",
            in_progress: "Diproses",
            pending: "Menunggu Info",
            resolved: "Selesai",
            closed: "Ditutup",
        };
        const newLabel = statusLabels[newStatus] || newStatus;

        const toastId = toast.loading(`Mengubah status ke ${newLabel}...`);

        try {
            const res = await fetch(`/api/tickets/${ticketId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Status berhasil diubah menjadi ${newLabel}`, { id: toastId });
                refetch();
            } else {
                const data = await res.json();
                toast.error(data.error || "Gagal mengubah status", { id: toastId });
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Terjadi kesalahan saat mengubah status", { id: toastId });
        }
    }, [ticket, ticketId, refetch]);

    const handlePriorityChange = useCallback(async (newPriority: string) => {
        if (!ticket) return;

        const priorityLabels: Record<string, string> = {
            low: "Rendah",
            normal: "Normal",
            high: "Tinggi",
            urgent: "Mendesak",
        };
        const newLabel = priorityLabels[newPriority] || newPriority;

        const toastId = toast.loading(`Mengubah prioritas ke ${newLabel}...`);

        try {
            const res = await fetch(`/api/tickets/${ticketId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priority: newPriority }),
            });
            if (res.ok) {
                toast.success(`Prioritas berhasil diubah menjadi ${newLabel}`, { id: toastId });
                refetch();
            } else {
                const data = await res.json();
                toast.error(data.error || "Gagal mengubah prioritas", { id: toastId });
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Terjadi kesalahan saat mengubah prioritas", { id: toastId });
        }
    }, [ticket, ticketId, refetch]);

    const handleEscalate = useCallback(async (): Promise<boolean> => {
        if (!ticket) return false;

        const currentLevel = ticket.level?.code || "L1";
        const nextLevel = currentLevel === "L1" ? "L2" : "L3";

        const toastId = toast.loading(`Mengeskasikan tiket ke ${nextLevel}...`);

        try {
            const res = await fetch(`/api/tickets/${ticketId}/escalate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            if (res.ok) {
                toast.success(`Tiket berhasil dieskalasi ke ${nextLevel}`, { id: toastId });
                // We don't refetch here because we expect the page to redirect
                // refetch(); 
                return true;
            } else {
                const error = await res.json();
                toast.error(error.error || "Gagal eskalasi", { id: toastId });
                return false;
            }
        } catch (error) {
            console.error("Escalate error:", error);
            toast.error("Terjadi kesalahan saat eskalasi", { id: toastId });
            return false;
        }
    }, [ticket, ticketId]);

    const handleAssigneeChange = useCallback(async (assigneeId: string | null, note?: string): Promise<boolean> => {
        const toastId = toast.loading("Menugaskan tiket...");

        try {
            const res = await fetch(`/api/tickets/${ticketId}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assigneeId, note }),
            });

            if (res.ok) {
                toast.success(assigneeId ? "Tiket berhasil ditugaskan" : "Penugasan tiket dihapus", { id: toastId });
                refetch();
                return true;
            } else {
                const data = await res.json();
                toast.error(data.error || "Gagal menugaskan tiket", { id: toastId });
                return false;
            }
        } catch (error) {
            console.error("Assign error:", error);
            toast.error("Terjadi kesalahan saat menugaskan tiket", { id: toastId });
            return false;
        }
    }, [ticketId, refetch]);

    const handleSendReply = useCallback(async (message: string, attachments?: PendingAttachment[]): Promise<boolean> => {
        if (!message.trim()) return false;
        setIsSubmitting(true);

        const toastId = toast.loading("Mengirim balasan...");

        try {
            const res = await fetch(`/api/tickets/${ticketId}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message,
                    attachments: attachments && attachments.length > 0 ? attachments : undefined,
                }),
            });
            if (res.ok) {
                toast.success("Balasan berhasil dikirim", { id: toastId });
                refetch();
                return true;
            } else {
                const data = await res.json();
                toast.error(data.error || "Gagal mengirim balasan", { id: toastId });
                return false;
            }
        } catch (error) {
            console.error("Reply error:", error);
            toast.error("Terjadi kesalahan saat mengirim balasan", { id: toastId });
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [ticketId, refetch]);

    const handleAddNote = useCallback(async (content: string, attachments?: PendingAttachment[]): Promise<boolean> => {
        if (!content.trim()) return false;
        setIsSubmitting(true);

        const toastId = toast.loading("Menambahkan catatan...");

        try {
            const res = await fetch(`/api/tickets/${ticketId}/note`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    attachments: attachments && attachments.length > 0 ? attachments : undefined,
                }),
            });
            if (res.ok) {
                toast.success("Catatan berhasil ditambahkan", { id: toastId });
                refetch();
                return true;
            } else {
                toast.error("Gagal menambah catatan", { id: toastId });
                return false;
            }
        } catch (error) {
            console.error("Note error:", error);
            toast.error("Terjadi kesalahan saat menambah catatan", { id: toastId });
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [ticketId, refetch]);

    const handleUploadAttachments = useCallback(async (files: PendingAttachment[]): Promise<boolean> => {
        if (files.length === 0) return false;
        try {
            const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attachments: files }),
            });
            if (res.ok) {
                toast.success(`${files.length} lampiran berhasil ditambahkan`);
                refetch();
                return true;
            } else {
                toast.error("Gagal menyimpan lampiran ke tiket");
                return false;
            }
        } catch (error) {
            console.error("Save attachment error:", error);
            toast.error("Gagal menyimpan lampiran");
            return false;
        }
    }, [ticketId, refetch]);

    const handleDeleteAttachment = useCallback(async (attachmentId: string): Promise<boolean> => {
        try {
            const res = await fetch(`/api/attachments/${attachmentId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Lampiran berhasil dihapus");
                refetch();
                return true;
            } else {
                toast.error("Gagal menghapus lampiran");
                return false;
            }
        } catch (error) {
            console.error("Delete attachment error:", error);
            toast.error("Terjadi kesalahan");
            return false;
        }
    }, [refetch]);

    return {
        ticket,
        isLoading,
        isSubmitting,
        refetch,
        handleStatusChange,
        handlePriorityChange,
        handleEscalate,
        handleAssigneeChange,
        handleSendReply,
        handleAddNote,
        handleUploadAttachments,
        handleDeleteAttachment,
    };
}
