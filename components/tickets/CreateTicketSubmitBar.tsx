"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Send, AlertTriangle, CheckCircle2 } from "lucide-react";

interface CreateTicketSubmitBarProps {
    isFormValid: boolean;
    isLoading: boolean;
    onCancel: () => void;
}

export function CreateTicketSubmitBar({
    isFormValid,
    isLoading,
    onCancel,
}: CreateTicketSubmitBarProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 z-10">
            <div className="flex items-center justify-between max-w-5xl">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isFormValid ? (
                        <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Form lengkap, siap submit</span>
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span>Lengkapi data yang diperlukan</span>
                        </>
                    )}
                </div>
                <div className="flex gap-3">
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
