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
    handleEscalate: () => Promise<void>;
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
        try {
            const res = await fetch(`/api/tickets/${ticketId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success("Status berhasil diubah");
                refetch();
            } else {
                toast.error("Gagal mengubah status");
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    }, [ticket, ticketId, refetch]);

    const handlePriorityChange = useCallback(async (newPriority: string) => {
        if (!ticket) return;
        try {
            const res = await fetch(`/api/tickets/${ticketId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priority: newPriority }),
            });
            if (res.ok) {
                toast.success("Prioritas berhasil diubah");
                refetch();
            } else {
                toast.error("Gagal mengubah prioritas");
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    }, [ticket, ticketId, refetch]);

    const handleEscalate = useCallback(async () => {
        if (!ticket) return;
        try {
            const res = await fetch(`/api/tickets/${ticketId}/escalate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            if (res.ok) {
                toast.success("Tiket berhasil dieskalasi");
                refetch();
            } else {
                const error = await res.json();
                toast.error(error.error || "Gagal eskalasi");
            }
        } catch (error) {
            console.error("Escalate error:", error);
        }
    }, [ticket, ticketId, refetch]);

    const handleSendReply = useCallback(async (message: string, attachments?: PendingAttachment[]): Promise<boolean> => {
        if (!message.trim()) return false;
        setIsSubmitting(true);
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
                toast.success("Balasan berhasil dikirim");
                refetch();
                return true;
            } else {
                toast.error("Gagal mengirim balasan");
                return false;
            }
        } catch (error) {
            console.error("Reply error:", error);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [ticketId, refetch]);

    const handleAddNote = useCallback(async (content: string, attachments?: PendingAttachment[]): Promise<boolean> => {
        if (!content.trim()) return false;
        setIsSubmitting(true);
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
                toast.success("Catatan berhasil ditambahkan");
                refetch();
                return true;
            } else {
                toast.error("Gagal menambah catatan");
                return false;
            }
        } catch (error) {
            console.error("Note error:", error);
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
        handleSendReply,
        handleAddNote,
        handleUploadAttachments,
        handleDeleteAttachment,
    };
}
