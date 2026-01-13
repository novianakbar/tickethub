"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Paperclip, Mail } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { PendingAttachment } from "@/types/ticket";

interface ReplyFormProps {
    onSubmit: (message: string, attachments?: PendingAttachment[]) => Promise<boolean>;
    isSubmitting: boolean;
}

export function ReplyForm({ onSubmit, isSubmitting }: ReplyFormProps) {
    const [replyText, setReplyText] = useState("");
    const { files, isUploading, inputRef, triggerUpload, handleFileChange, removeFile, clearFiles } = useFileUpload({
        folder: "replies",
    });

    const handleSend = async () => {
        if (!replyText.trim()) return;
        const success = await onSubmit(replyText, files.length > 0 ? files : undefined);
        if (success) {
            setReplyText("");
            clearFiles();
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">Balasan akan terlihat oleh pelanggan.</span>
                    <span className="ml-1">Pastikan isi pesan sopan dan informatif.</span>
                </div>
            </div>

            <Label className="text-sm font-medium">Tulis Balasan</Label>
            <Textarea
                placeholder="Tulis balasan untuk pelanggan..."
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="resize-none"
            />

            {/* Attachments Preview */}
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {files.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs border rounded px-2 py-1 bg-muted/50">
                            <Paperclip className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{att.fileName}</span>
                            <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="text-muted-foreground hover:text-red-500"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                    multiple
                    onChange={handleFileChange}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={triggerUpload}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Paperclip className="h-4 w-4" />
                    )}
                    Lampiran
                </Button>
                <Button onClick={handleSend} disabled={isSubmitting || !replyText.trim()}>
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Mengirim..." : "Kirim Balasan"}
                </Button>
            </div>
        </div>
    );
}
