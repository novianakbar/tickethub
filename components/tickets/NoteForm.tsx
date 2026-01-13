"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Paperclip, AlertCircle } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { PendingAttachment } from "@/types/ticket";

interface NoteFormProps {
    onSubmit: (content: string, attachments?: PendingAttachment[]) => Promise<boolean>;
    isSubmitting: boolean;
}

export function NoteForm({ onSubmit, isSubmitting }: NoteFormProps) {
    const [noteText, setNoteText] = useState("");
    const { files, isUploading, inputRef, triggerUpload, handleFileChange, removeFile, clearFiles } = useFileUpload({
        folder: "notes",
    });

    const handleSave = async () => {
        if (!noteText.trim()) return;
        const success = await onSubmit(noteText, files.length > 0 ? files : undefined);
        if (success) {
            setNoteText("");
            clearFiles();
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-700 dark:text-amber-300">
                    <span className="font-semibold">Catatan internal - TIDAK terlihat oleh pelanggan.</span>
                    <span className="ml-1">Gunakan untuk dokumentasi atau koordinasi tim.</span>
                </div>
            </div>

            <Label className="text-sm font-medium">Tambah Catatan Internal</Label>
            <Textarea
                placeholder="Catatan internal (tidak terlihat pelanggan)..."
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
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
                <Button variant="secondary" onClick={handleSave} disabled={isSubmitting || !noteText.trim()}>
                    <FileText className="h-4 w-4" />
                    {isSubmitting ? "Menyimpan..." : "Simpan Catatan"}
                </Button>
            </div>
        </div>
    );
}
