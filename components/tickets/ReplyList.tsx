"use client";

import { MessageSquare, Image as ImageIcon, FileText, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TicketReply, Attachment } from "@/types/ticket";

interface ReplyListProps {
    replies: TicketReply[];
    onViewAttachment: (attachment: Attachment) => void;
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

export function ReplyList({ replies, onViewAttachment }: ReplyListProps) {
    if (replies.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                    Belum ada balasan
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {replies.map((reply) => {
                const isCustomer = reply.isCustomer || !reply.author;
                const displayName = isCustomer
                    ? "Pelanggan"
                    : (reply.author?.fullName || reply.author?.email || "Unknown");

                return (
                    <div
                        key={reply.id}
                        className={`rounded-lg border p-4 ${isCustomer ? "bg-primary/5 border-primary/20" : ""}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${isCustomer ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
                                    }`}>
                                    {isCustomer ? <User className="h-4 w-4" /> : getInitials(displayName)}
                                </div>
                                <span className="text-sm font-medium">
                                    {displayName}
                                </span>
                                {isCustomer && (
                                    <Badge variant="outline" className="text-xs">
                                        Pelanggan
                                    </Badge>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {formatDateTime(reply.createdAt)}
                            </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                        {reply.attachments && reply.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t">
                                {reply.attachments.map((att) => (
                                    <button
                                        key={att.id}
                                        onClick={() => onViewAttachment(att)}
                                        className="flex items-center gap-1 text-xs border rounded px-2 py-1 bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        {att.fileType.startsWith("image/") ? (
                                            <ImageIcon className="h-3 w-3 text-blue-500" />
                                        ) : (
                                            <FileText className="h-3 w-3 text-red-500" />
                                        )}
                                        <span className="truncate max-w-[100px]">{att.fileName}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

