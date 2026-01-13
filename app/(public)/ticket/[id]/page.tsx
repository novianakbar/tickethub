"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getVerifiedTicket } from "@/lib/public-ticket-session";
import type { PublicTicket, PublicTicketStatus } from "@/types/public-ticket";
import { toast } from "sonner";
import {
    Clock,
    CheckCircle,
    XCircle,
    ArrowUpRight,
    Pause,
    MessageSquare,
    Paperclip,
    User,
    Mail,
    Calendar,
    FileText,
    Image as ImageIcon,
    Download,
    ArrowLeft,
    Loader2,
    Activity,
    Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<PublicTicketStatus, {
    label: string;
    className: string;
    description: string;
    icon: typeof Clock;
}> = {
    open: {
        label: "Menunggu Diproses",
        className: "bg-blue-100 text-blue-700 border-blue-200",
        description: "Tiket Anda telah diterima dan menunggu untuk diproses",
        icon: Clock,
    },
    in_progress: {
        label: "Sedang Diproses",
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        description: "Tim kami sedang menangani tiket Anda",
        icon: ArrowUpRight,
    },
    pending: {
        label: "Menunggu Respons",
        className: "bg-orange-100 text-orange-700 border-orange-200",
        description: "Kami membutuhkan informasi tambahan dari Anda",
        icon: Pause,
    },
    resolved: {
        label: "Selesai",
        className: "bg-green-100 text-green-700 border-green-200",
        description: "Tiket Anda telah berhasil diselesaikan",
        icon: CheckCircle,
    },
    closed: {
        label: "Ditutup",
        className: "bg-gray-100 text-gray-700 border-gray-200",
        description: "Tiket ini telah ditutup",
        icon: XCircle,
    },
};

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function TicketDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [ticket, setTicket] = useState<PublicTicket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sessionEmail, setSessionEmail] = useState("");

    useEffect(() => {
        // Check session for verified ticket
        const session = getVerifiedTicket(id);

        if (!session) {
            // Not verified, redirect to home
            router.replace("/");
            return;
        }

        setTicket(session.ticket);
        setSessionEmail(session.email);
        setIsLoading(false);
    }, [id, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!ticket) {
        return null;
    }

    const handleSubmitReply = async () => {
        if (!replyMessage.trim()) {
            toast.error("Pesan tidak boleh kosong");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/public/tickets/${ticket.id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: replyMessage.trim(),
                    email: sessionEmail,
                    ticketNumber: ticket.ticketNumber,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Balasan berhasil dikirim");
                setReplyMessage("");
                // Add new reply to local state
                setTicket({
                    ...ticket,
                    replies: [
                        ...ticket.replies,
                        {
                            message: replyMessage.trim(),
                            createdAt: new Date().toISOString(),
                            isCustomer: true,
                            attachments: [],
                        },
                    ],
                });
            } else {
                toast.error(data.error || "Gagal mengirim balasan");
            }
        } catch (error) {
            console.error("Reply error:", error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const status = statusConfig[ticket.status];
    const StatusIcon = status.icon;

    return (
        <div className="container max-w-3xl py-8">
            {/* Back Link */}
            <Link
                href="/"
                className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke pencarian
            </Link>

            {/* Status Card */}
            <Card className={cn("mb-6 border-2", status.className)}>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-full",
                            status.className
                        )}>
                            <StatusIcon className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Status Tiket</p>
                            <h2 className="text-xl font-bold">{status.label}</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {status.description}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Ticket Info */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="mb-1 font-mono text-sm text-muted-foreground">
                                {ticket.ticketNumber}
                            </p>
                            <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                        </div>
                        <Badge
                            variant="outline"
                            style={{ borderColor: ticket.category.color, color: ticket.category.color }}
                        >
                            {ticket.category.name}
                        </Badge>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            {ticket.customerName}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {ticket.customerEmail}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Dibuat: {formatDate(ticket.createdAt)}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Diperbarui: {formatDate(ticket.updatedAt)}
                        </div>
                        {ticket.resolvedAt && (
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                Diselesaikan: {formatDate(ticket.resolvedAt)}
                            </div>
                        )}
                        {ticket.closedAt && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <XCircle className="h-4 w-4" />
                                Ditutup: {formatDate(ticket.closedAt)}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Replies */}
            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Balasan ({ticket.replies.length})
                    </CardTitle>
                    <CardDescription>
                        Riwayat komunikasi tiket
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {ticket.replies.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Belum ada balasan
                        </p>
                    ) : (
                        ticket.replies.map((reply, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "rounded-lg border p-4",
                                    reply.isCustomer ? "bg-primary/5 border-primary/20" : ""
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-sm font-medium",
                                            reply.isCustomer ? "text-primary" : "text-muted-foreground"
                                        )}>
                                            {reply.isCustomer ? "Anda" : "Tim Support"}
                                        </span>
                                        {reply.isCustomer && (
                                            <Badge variant="outline" className="text-xs">
                                                Pelanggan
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDate(reply.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                                {reply.attachments && reply.attachments.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {reply.attachments.map((att, attIndex) => (
                                            <a
                                                key={attIndex}
                                                href={att.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs hover:bg-muted transition-colors"
                                            >
                                                {att.fileType.startsWith("image/") ? (
                                                    <ImageIcon className="h-3 w-3 text-blue-500" />
                                                ) : (
                                                    <FileText className="h-3 w-3 text-red-500" />
                                                )}
                                                <span className="max-w-[120px] truncate">{att.fileName}</span>
                                                <Download className="h-3 w-3" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {/* Reply Form */}
                    <Separator className="my-4" />
                    <div className="space-y-3">
                        <Textarea
                            placeholder="Tulis balasan Anda..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            rows={3}
                            disabled={isSubmitting}
                        />
                        <Button
                            onClick={handleSubmitReply}
                            disabled={isSubmitting || !replyMessage.trim()}
                            className="w-full sm:w-auto"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            Kirim Balasan
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Attachments */}
            {ticket.attachments.length > 0 && (
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Paperclip className="h-5 w-5" />
                            Lampiran ({ticket.attachments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {ticket.attachments.map((att, index) => (
                                <a
                                    key={index}
                                    href={att.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:bg-muted transition-colors"
                                >
                                    {att.fileType.startsWith("image/") ? (
                                        <ImageIcon className="h-4 w-4 text-blue-500" />
                                    ) : (
                                        <FileText className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="max-w-[150px] truncate">{att.fileName}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatFileSize(att.fileSize)}
                                    </span>
                                    <Download className="h-3 w-3" />
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Activity Timeline */}
            {ticket.activities && ticket.activities.length > 0 && (
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Riwayat Tiket
                        </CardTitle>
                        <CardDescription>
                            Progres penanganan tiket Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {ticket.activities.map((activity, index) => (
                                <div key={index} className="relative flex gap-3">
                                    {/* Timeline line */}
                                    {index < ticket.activities.length - 1 && (
                                        <div className="absolute left-[11px] top-6 h-full w-0.5 bg-border" />
                                    )}
                                    {/* Icon */}
                                    <div className={cn(
                                        "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                                        activity.type === "created" ? "bg-blue-100 text-blue-600" :
                                            activity.type === "status_change" ? "bg-yellow-100 text-yellow-600" :
                                                activity.type === "reply" ? "bg-green-100 text-green-600" :
                                                    activity.type === "escalate" ? "bg-purple-100 text-purple-600" :
                                                        activity.type === "customer_reply" ? "bg-primary/10 text-primary" :
                                                            "bg-gray-100 text-gray-600"
                                    )}>
                                        {activity.type === "created" && <Clock className="h-3 w-3" />}
                                        {activity.type === "status_change" && <ArrowUpRight className="h-3 w-3" />}
                                        {activity.type === "reply" && <MessageSquare className="h-3 w-3" />}
                                        {activity.type === "escalate" && <ArrowUpRight className="h-3 w-3" />}
                                        {activity.type === "customer_reply" && <User className="h-3 w-3" />}
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 pt-0.5">
                                        <p className="text-sm">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {formatDate(activity.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Help Section */}
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                    Ada pertanyaan? Hubungi tim support kami untuk bantuan lebih lanjut.
                </p>
                <Button variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        Cek Tiket Lain
                    </Link>
                </Button>
            </div>
        </div>
    );
}
