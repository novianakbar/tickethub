"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    sourceOptions,
    createTicketPriorityOptions,
} from "@/lib/ticket-config";
import type { CreateTicketFormData, CreateTicketFormErrors, CategoryOption, LevelOption, SLAConfig } from "@/types/create-ticket";

interface CreateTicketClassificationCardProps {
    formData: CreateTicketFormData;
    errors: CreateTicketFormErrors;
    updateField: (field: string, value: string) => void;
    categories: CategoryOption[];
    levels: LevelOption[];
    slaConfigs?: SLAConfig[];
    onDueDateChange?: (value: string) => void;
}

// Helper function to format SLA duration
function formatSlaDuration(hours: number): string {
    if (hours < 24) return `${hours} jam`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days} hari`;
    return `${days}h ${remainingHours}j`;
}

export function CreateTicketClassificationCard({
    formData,
    errors,
    updateField,
    categories,
    levels,
    slaConfigs = [],
    onDueDateChange,
}: CreateTicketClassificationCardProps) {
    // Get SLA duration for a priority
    const getSlaLabel = (priority: string): string => {
        const config = slaConfigs.find(c => c.priority === priority);
        return config ? formatSlaDuration(config.durationHrs) : "";
    };
    return (
        <div className="space-y-4">
            {/* Category & Classification */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Klasifikasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Category */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">
                            Kategori <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.categoryId}
                            onValueChange={(value) => updateField("categoryId", value)}
                        >
                            <SelectTrigger className={cn("h-9", errors.categoryId && "border-red-500")}>
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                            {cat.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.categoryId && (
                            <p className="text-xs text-red-500">{errors.categoryId}</p>
                        )}
                    </div>

                    {/* Source */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">
                            Sumber <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.source}
                            onValueChange={(value) => updateField("source", value)}
                        >
                            <SelectTrigger className={cn("h-9", errors.source && "border-red-500")}>
                                <SelectValue placeholder="Pilih sumber" />
                            </SelectTrigger>
                            <SelectContent>
                                {sourceOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.source && (
                            <p className="text-xs text-red-500">{errors.source}</p>
                        )}
                    </div>

                    {/* Source Notes */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Catatan Sumber</Label>
                            <span className="text-xs text-muted-foreground">
                                {formData.sourceNotes?.length || 0}/500
                            </span>
                        </div>
                        <Textarea
                            placeholder="Catatan tambahan tentang sumber tiket (opsional)"
                            value={formData.sourceNotes || ""}
                            onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                    updateField("sourceNotes", e.target.value);
                                }
                            }}
                            rows={2}
                            className="text-sm resize-none"
                        />
                    </div>

                    <Separator />

                    {/* Level */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">
                            Level <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.levelId}
                            onValueChange={(value) => updateField("levelId", value)}
                        >
                            <SelectTrigger className={cn("h-9", errors.levelId && "border-red-500")}>
                                <SelectValue placeholder="Pilih level" />
                            </SelectTrigger>
                            <SelectContent>
                                {levels.map((opt) => (
                                    <SelectItem key={opt.id} value={opt.id}>
                                        {opt.code} - {opt.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.levelId && (
                            <p className="text-xs text-red-500">{errors.levelId}</p>
                        )}
                    </div>

                    {/* Priority */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">
                            Prioritas <span className="text-red-500">*</span>
                        </Label>
                        <div className={cn(
                            "grid grid-cols-2 gap-2 p-2 rounded-md",
                            errors.priority && "ring-1 ring-red-500"
                        )}>
                            {createTicketPriorityOptions.map((opt) => {
                                const slaDuration = getSlaLabel(opt.value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => updateField("priority", opt.value)}
                                        className={cn(
                                            "px-3 py-2 rounded-md text-xs font-medium transition-all",
                                            formData.priority === opt.value
                                                ? cn(opt.color, "ring-2 ring-offset-1 ring-primary")
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span>{opt.label}</span>
                                            {slaDuration && (
                                                <span className="text-[10px] opacity-70">({slaDuration})</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.priority && (
                            <p className="text-xs text-red-500">{errors.priority}</p>
                        )}
                    </div>

                    <Separator />

                    {/* Due Date */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Target Selesai (SLA)
                            </Label>
                            {formData.dueDate && (
                                <button
                                    type="button"
                                    onClick={() => onDueDateChange?.("")}
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                        <Input
                            type="datetime-local"
                            value={formData.dueDate}
                            onChange={(e) => onDueDateChange?.(e.target.value)}
                            className="h-9"
                        />
                        <p className="text-xs text-muted-foreground">
                            Otomatis dihitung dari SLA, bisa diubah manual
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Info Box */}
            <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div className="text-xs text-blue-800 dark:text-blue-300">
                            <p className="font-medium mb-1">Tips</p>
                            <ul className="list-disc list-inside space-y-0.5 text-blue-700 dark:text-blue-400">
                                <li>Masukkan email untuk auto-fill data pelanggan existing</li>
                                <li>Gunakan template untuk tiket umum</li>
                                <li>Upload bukti/screenshot jika ada</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

