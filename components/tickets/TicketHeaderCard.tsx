"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Mail,
    Phone,
    AlertCircle,
    Paperclip,
    Plus,
    Loader2,
    FileText,
    Eye,
    Download,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { TicketDetail, Attachment, PendingAttachment, StatusConfigItem, PriorityConfigItem } from "@/types/ticket";
import { getLevelClassName } from "@/lib/ticket-config";

// Level border colors
const levelBorderColors: Record<string, string> = {
    L1: "border-l-blue-500",
    L2: "border-l-orange-500",
    L3: "border-l-purple-500",
};

interface TicketHeaderCardProps {
    ticket: TicketDetail;
    levelConfig?: Record<string, { label: string; className: string; border: string }>; // Legacy, kept for compatibility
    statusConfig: Record<string, StatusConfigItem>;
    priorityConfig: Record<string, PriorityConfigItem>;
    onViewAttachment: (attachment: Attachment) => void;
    onDeleteAttachment: (attachmentId: string) => Promise<boolean>;
    onUploadAttachments: (files: PendingAttachment[]) => Promise<boolean>;
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

function getInitials(name: string): string {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

export function TicketHeaderCard({
    ticket,
    statusConfig,
    priorityConfig,
    onViewAttachment,
    onDeleteAttachment,
    onUploadAttachments,
}: TicketHeaderCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const uploadedFiles: PendingAttachment[] = [];

        for (const file of Array.from(files)) {
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", "tickets");

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    uploadedFiles.push({
                        fileName: data.file.name,
                        fileKey: data.file.key,
                        fileUrl: data.file.url,
                        fileSize: data.file.size,
                        fileType: data.file.type,
                    });
                } else {
                    const error = await res.json();
                    toast.error(error.error || `Gagal upload ${file.name}`);
                }
            } catch (error) {
                console.error("Upload error:", error);
                toast.error(`Gagal upload ${file.name}`);
            }
        }

        if (uploadedFiles.length > 0) {
            await onUploadAttachments(uploadedFiles);
        }

        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDeleteClick = async (attachmentId: string) => {
        if (!confirm("Hapus lampiran ini?")) return;
        await onDeleteAttachment(attachmentId);
    };

    // Get level info from ticket.level object
    const levelCode = ticket.level?.code ?? "L1";
    const levelLabel = ticket.level ? `${ticket.level.code} - ${ticket.level.name}` : "L1";
    const levelClassName = getLevelClassName(levelCode);
    const levelBorder = levelBorderColors[levelCode] || "border-l-gray-400";

    // Default fallback configs for safety
    const defaultStatus = { label: ticket.status || "Unknown", className: "bg-gray-100 text-gray-800" };
    const defaultPriority = { label: ticket.priority || "Unknown", className: "text-gray-500" };

    const status = statusConfig[ticket.status] || defaultStatus;
    const priority = priorityConfig[ticket.priority] || defaultPriority;

    return (
        <Card className={cn("border-l-4", levelBorder)}>
            <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                    {/* Customer Avatar */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {getInitials(ticket.customerName)}
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Customer Name & Company */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-semibold">{ticket.customerName}</span>
                            {ticket.customerCompany && (
                                <span className="text-sm text-muted-foreground">• {ticket.customerCompany}</span>
                            )}
                        </div>

                        {/* Contact Info - Inline */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-0.5">
                            <a href={`mailto:${ticket.customerEmail}`} className="hover:text-primary transition-colors inline-flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {ticket.customerEmail}
                            </a>
                            {ticket.customerPhone && (
                                <a href={`tel:${ticket.customerPhone}`} className="hover:text-primary transition-colors inline-flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {ticket.customerPhone}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs", levelClassName)}>
                        {levelLabel}
                    </Badge>
                    <Badge className={cn("text-xs", status.className)}>
                        {status.label}
                    </Badge>
                    <span className={cn("text-xs", priority.className)}>
                        {ticket.priority === "urgent" && <AlertCircle className="h-3 w-3 inline mr-1" />}
                        {priority.label}
                    </span>
                    <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: ticket.category.color, color: ticket.category.color }}
                    >
                        {ticket.category.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        • {formatDateTime(ticket.createdAt)}
                    </span>
                </div>

                {/* Subject */}
                <h2 className="text-base font-semibold">
                    {ticket.subject}
                </h2>

                {/* Description */}
                <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {ticket.description}
                    </p>
                </div>

                {/* Attachments - Inline */}
                <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Paperclip className="h-3 w-3" />
                            Lampiran ({ticket.attachments.length})
                        </p>
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                                multiple
                                onChange={handleFileUpload}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="h-7 text-xs"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Plus className="h-3 w-3" />
                                )}
                                {isUploading ? "Uploading..." : "Tambah"}
                            </Button>
                        </div>
                    </div>
                    {ticket.attachments.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {ticket.attachments.map((att) => (
                                <div key={att.id} className="group relative">
                                    <button
                                        type="button"
                                        onClick={() => onViewAttachment(att)}
                                        className="text-left"
                                    >
                                        {att.fileType.startsWith("image/") ? (
                                            <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-muted">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={att.fileUrl} alt={att.fileName} className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Eye className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs hover:bg-muted transition-colors">
                                                <FileText className="h-4 w-4 text-red-500" />
                                                <span className="max-w-[100px] truncate">{att.fileName}</span>
                                                {att.fileType.includes("pdf") ? (
                                                    <Eye className="h-3 w-3 text-muted-foreground" />
                                                ) : (
                                                    <Download className="h-3 w-3 text-muted-foreground" />
                                                )}
                                            </div>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(att.id)}
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                                        title="Hapus"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">Belum ada lampiran</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
