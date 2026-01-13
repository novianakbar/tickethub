"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Search,
    Loader2,
    Ticket,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
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
} from "lucide-react";

interface TicketResult {
    id: string;
    ticketNumber: string;
    subject: string;
    status: "open" | "in_progress" | "pending" | "resolved" | "closed";
    priority: "low" | "normal" | "high" | "urgent";
    level: string;
    customerName: string;
    customerEmail: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    closedAt: string | null;
    category: {
        name: string;
        color: string;
    };
    replies: Array<{
        message: string;
        createdAt: string;
        author: { fullName: string | null };
    }>;
    attachments: Array<{
        fileName: string;
        fileUrl: string;
        fileSize: number;
        fileType: string;
    }>;
}

const statusConfig = {
    open: { label: "Menunggu Diproses", icon: Clock, className: "bg-blue-100 text-blue-700 border-blue-200", description: "Tiket Anda sedang dalam antrian dan akan segera ditangani." },
    in_progress: { label: "Sedang Diproses", icon: ArrowUpRight, className: "bg-yellow-100 text-yellow-700 border-yellow-200", description: "Tim kami sedang menangani tiket Anda." },
    pending: { label: "Menunggu Respons", icon: Pause, className: "bg-orange-100 text-orange-700 border-orange-200", description: "Kami membutuhkan informasi tambahan dari Anda." },
    resolved: { label: "Selesai", icon: CheckCircle, className: "bg-green-100 text-green-700 border-green-200", description: "Tiket Anda telah diselesaikan. Silakan hubungi kami jika ada pertanyaan lain." },
    closed: { label: "Ditutup", icon: XCircle, className: "bg-gray-100 text-gray-700 border-gray-200", description: "Tiket ini telah ditutup." },
};

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString("id-ID", {
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

export default function PublicTicketLookupPage() {
    const [ticketNumber, setTicketNumber] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [ticket, setTicket] = useState<TicketResult | null>(null);
    const [error, setError] = useState("");

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setTicket(null);

        if (!ticketNumber.trim() || !email.trim()) {
            toast.error("Isi nomor tiket dan email");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/public/tickets/lookup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ticketNumber: ticketNumber.trim().toUpperCase(),
                    email: email.trim().toLowerCase()
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setTicket(data.ticket);
            } else {
                const data = await res.json();
                setError(data.error || "Tiket tidak ditemukan");
            }
        } catch (err) {
            console.error("Lookup error:", err);
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setTicket(null);
        setTicketNumber("");
        setEmail("");
        setError("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto max-w-3xl px-4 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                        <Ticket className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Cek Status Tiket</h1>
                    <p className="text-muted-foreground">
                        Masukkan nomor tiket dan email untuk melihat status permintaan Anda
                    </p>
                </div>

                {/* Lookup Form */}
                {!ticket && (
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <form onSubmit={handleLookup} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="ticketNumber">Nomor Tiket</Label>
                                        <Input
                                            id="ticketNumber"
                                            placeholder="TKT-XXXXXX"
                                            value={ticketNumber}
                                            onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                                            className="font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="email@contoh.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Mencari...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4" />
                                            Cek Status
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Ticket Result */}
                {ticket && (
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card className={cn("border-2", statusConfig[ticket.status].className)}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "flex h-14 w-14 items-center justify-center rounded-full",
                                        statusConfig[ticket.status].className
                                    )}>
                                        {(() => {
                                            const StatusIcon = statusConfig[ticket.status].icon;
                                            return <StatusIcon className="h-7 w-7" />;
                                        })()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">Status Tiket</p>
                                        <h2 className="text-xl font-bold">{statusConfig[ticket.status].label}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {statusConfig[ticket.status].description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ticket Info */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardDescription className="font-mono">{ticket.ticketNumber}</CardDescription>
                                        <CardTitle className="text-lg mt-1">{ticket.subject}</CardTitle>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        style={{ borderColor: ticket.category.color, color: ticket.category.color }}
                                    >
                                        {ticket.category.name}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2 text-sm">
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
                                        Dibuat: {formatDateTime(ticket.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        Diperbarui: {formatDateTime(ticket.updatedAt)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Replies */}
                        {ticket.replies.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        Balasan ({ticket.replies.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {ticket.replies.map((reply, index) => (
                                        <div key={index} className="rounded-lg border p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-primary">
                                                    {reply.author?.fullName || "Tim Support"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDateTime(reply.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Attachments */}
                        {ticket.attachments.length > 0 && (
                            <Card>
                                <CardHeader>
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

                        {/* Back Button */}
                        <div className="text-center">
                            <Button variant="outline" onClick={handleReset}>
                                <Search className="h-4 w-4" />
                                Cek Tiket Lain
                            </Button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-muted-foreground">
                    <p>Butuh bantuan? Hubungi kami melalui email atau telepon.</p>
                </div>
            </div>
        </div>
    );
}
