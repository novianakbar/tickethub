"use client";

import { FileText, Image as ImageIcon } from "lucide-react";
import type { TicketNote, Attachment } from "@/types/ticket";

interface NoteListProps {
    notes: TicketNote[];
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

export function NoteList({ notes, onViewAttachment }: NoteListProps) {
    if (notes.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                    Belum ada catatan internal
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {notes.map((note) => (
                <div key={note.id} className="rounded-lg border-l-2 border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                            {note.author.fullName || note.author.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {formatDateTime(note.createdAt)}
                        </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    {note.attachments && note.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                            {note.attachments.map((att) => (
                                <button
                                    key={att.id}
                                    onClick={() => onViewAttachment(att)}
                                    className="flex items-center gap-1 text-xs border rounded px-2 py-1 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
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
            ))}
        </div>
    );
}
