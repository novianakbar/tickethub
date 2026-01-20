"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SLAConfig {
    id: string;
    priority: string;
    durationHrs: number;
    description: string | null;
    isActive: boolean;
}

interface EditedConfig {
    durationHrs?: number;
    description?: string;
    isActive?: boolean;
}

const priorityLabels: Record<string, { label: string; className: string }> = {
    low: {
        label: "Rendah",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    },
    normal: {
        label: "Normal",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    high: {
        label: "Tinggi",
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    },
    urgent: {
        label: "Mendesak",
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
};

export function SLASettings() {
    const [configs, setConfigs] = useState<SLAConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editedConfigs, setEditedConfigs] = useState<Record<string, EditedConfig>>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    const fetchConfigs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/settings/sla");
            if (res.ok) {
                const data = await res.json();
                setConfigs(data.configs);
            }
        } catch (error) {
            console.error("Failed to fetch SLA configs:", error);
            toast.error("Gagal memuat konfigurasi SLA");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleFieldChange = (id: string, field: keyof EditedConfig, value: number | string | boolean) => {
        setEditedConfigs((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value },
        }));
    };

    const handleSave = async (config: SLAConfig) => {
        const edited = editedConfigs[config.id];
        if (!edited) return;

        setSavingId(config.id);
        try {
            const res = await fetch("/api/settings/sla", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: config.id,
                    durationHrs: edited.durationHrs ?? config.durationHrs,
                    description: edited.description ?? config.description,
                    isActive: edited.isActive ?? config.isActive,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to update");
            }

            toast.success(`SLA ${priorityLabels[config.priority]?.label || config.priority} berhasil diperbarui`);

            // Update local state
            setConfigs((prev) =>
                prev.map((c) =>
                    c.id === config.id
                        ? {
                            ...c,
                            durationHrs: edited.durationHrs ?? c.durationHrs,
                            description: edited.description ?? c.description,
                            isActive: edited.isActive ?? c.isActive,
                        }
                        : c
                )
            );

            // Clear edit state
            setEditedConfigs((prev) => {
                const newState = { ...prev };
                delete newState[config.id];
                return newState;
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal memperbarui SLA";
            toast.error(message);
        } finally {
            setSavingId(null);
        }
    };

    const getDisplayValue = <K extends keyof SLAConfig>(config: SLAConfig, field: K): SLAConfig[K] => {
        const edited = editedConfigs[config.id];
        if (edited && field in edited) {
            return (edited as Record<string, unknown>)[field as string] as SLAConfig[K];
        }
        return config[field];
    };

    const hasChanges = (configId: string) => {
        return editedConfigs[configId] !== undefined;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Konfigurasi SLA</h3>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Durasi SLA per Prioritas
                    </CardTitle>
                    <CardDescription>
                        Atur target waktu penyelesaian tiket berdasarkan prioritas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {configs.map((config) => (
                            <div
                                key={config.id}
                                className={cn(
                                    "p-4 rounded-lg border",
                                    getDisplayValue(config, "isActive")
                                        ? "bg-muted/30"
                                        : "bg-muted/10 opacity-60"
                                )}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            className={cn(
                                                "min-w-[100px] justify-center",
                                                priorityLabels[config.priority]?.className
                                            )}
                                        >
                                            {priorityLabels[config.priority]?.label || config.priority}
                                        </Badge>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={getDisplayValue(config, "isActive") as boolean}
                                                onCheckedChange={(checked) =>
                                                    handleFieldChange(config.id, "isActive", checked)
                                                }
                                            />
                                            <Label className="text-xs text-muted-foreground">
                                                {getDisplayValue(config, "isActive") ? "Aktif" : "Nonaktif"}
                                            </Label>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        disabled={!hasChanges(config.id) || savingId === config.id}
                                        onClick={() => handleSave(config)}
                                        className="h-8"
                                    >
                                        {savingId === config.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-1" />
                                                Simpan
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Target Durasi</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={getDisplayValue(config, "durationHrs")}
                                                onChange={(e) =>
                                                    handleFieldChange(config.id, "durationHrs", parseInt(e.target.value) || 0)
                                                }
                                                className="w-24 h-8"
                                            />
                                            <span className="text-sm text-muted-foreground">jam</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Deskripsi</Label>
                                        <Input
                                            placeholder="Deskripsi opsional..."
                                            value={(getDisplayValue(config, "description") as string) || ""}
                                            onChange={(e) =>
                                                handleFieldChange(config.id, "description", e.target.value)
                                            }
                                            className="h-8"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div className="text-xs text-blue-800 dark:text-blue-300">
                            <p className="font-medium mb-1">Cara Kerja SLA</p>
                            <ul className="list-disc list-inside space-y-0.5 text-blue-700 dark:text-blue-400">
                                <li>Durasi SLA menentukan target waktu penyelesaian tiket</li>
                                <li>Due date akan dihitung otomatis saat membuat tiket baru</li>
                                <li>Agent dapat override due date secara manual jika diperlukan</li>
                                <li>SLA yang nonaktif tidak akan digunakan untuk auto-calculate</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
