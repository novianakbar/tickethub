"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Send, AlertTriangle, CheckCircle2, Mail, Folder, Flag, Layers } from "lucide-react";
import type { CreateTicketFormData, CategoryOption, LevelOption } from "@/types/create-ticket";
import { createTicketPriorityOptions } from "@/lib/ticket-config";

interface CreateTicketSubmitBarProps {
    isFormValid: boolean;
    isLoading: boolean;
    onCancel: () => void;
    formData?: CreateTicketFormData;
    categories?: CategoryOption[];
    levels?: LevelOption[];
}

export function CreateTicketSubmitBar({
    isFormValid,
    isLoading,
    onCancel,
    formData,
    categories = [],
    levels = [],
}: CreateTicketSubmitBarProps) {
    // Get display values
    const categoryName = categories.find(c => c.id === formData?.categoryId)?.name;
    const levelCode = levels.find(l => l.id === formData?.levelId)?.code;
    const priorityLabel = createTicketPriorityOptions.find(p => p.value === formData?.priority)?.label;

    const hasPreviewData = formData?.customerEmail || categoryName || priorityLabel || levelCode;

    return (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 z-10">
            <div className="flex items-center justify-between max-w-5xl gap-4">
                <div className="flex-1 min-w-0">
                    {isFormValid && hasPreviewData ? (
                        <div className="flex items-center gap-3 text-sm flex-wrap">
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
                                {formData?.customerEmail && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <span className="truncate max-w-[150px]">{formData.customerEmail}</span>
                                    </span>
                                )}
                                {categoryName && (
                                    <span className="flex items-center gap-1">
                                        <span className="text-muted-foreground/50">|</span>
                                        <Folder className="h-3 w-3" />
                                        {categoryName}
                                    </span>
                                )}
                                {priorityLabel && (
                                    <span className="flex items-center gap-1">
                                        <span className="text-muted-foreground/50">|</span>
                                        <Flag className="h-3 w-3" />
                                        {priorityLabel}
                                    </span>
                                )}
                                {levelCode && (
                                    <span className="flex items-center gap-1">
                                        <span className="text-muted-foreground/50">|</span>
                                        <Layers className="h-3 w-3" />
                                        {levelCode}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span>Lengkapi data yang diperlukan</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-3 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Batal
                    </Button>
                    <Button type="submit" disabled={isLoading || !isFormValid}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Buat Tiket
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
