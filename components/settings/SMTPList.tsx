"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Server, Pencil, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SMTPForm, SMTPFormValues } from "@/components/settings/SMTPForm";
import { toast } from "sonner";

interface SMTPConfig {
    id: string;
    name: string;
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string; // Will typically be masked in real app
    fromName: string;
    fromEmail: string;
    isDefault: boolean;
}

export function SMTPList() {
    const [configs, setConfigs] = useState<SMTPConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<SMTPConfig | null>(null);
    const [configToDelete, setConfigToDelete] = useState<SMTPConfig | null>(null);

    const fetchConfigs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/settings/smtp");
            if (res.ok) {
                const data = await res.json();
                setConfigs(data);
            }
        } catch (error) {
            console.error("Failed to fetch SMTP configs", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleOpenDialog = (config?: SMTPConfig) => {
        if (config) {
            setSelectedConfig(config);
        } else {
            setSelectedConfig(null);
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedConfig(null);
    };

    const handleSuccess = () => {
        handleCloseDialog();
        fetchConfigs();
    };

    const handleDelete = async () => {
        if (!configToDelete) return;

        try {
            const res = await fetch(`/api/settings/smtp/${configToDelete.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to delete");
            }

            toast.success("Konfigurasi berhasil dihapus");
            fetchConfigs();
        } catch (error: any) {
            toast.error(error.message || "Gagal menghapus konfigurasi");
        } finally {
            setConfigToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Konfigurasi SMTP</h3>
                <Button onClick={() => handleOpenDialog()} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah SMTP
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">Loading...</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {configs.map((config) => (
                        <Card key={config.id} className="relative overflow-hidden">
                            {config.isDefault && (
                                <div className="absolute top-0 right-0 p-2">
                                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Default</Badge>
                                </div>
                            )}
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Server size={20} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <CardTitle className="truncate text-base">{config.name}</CardTitle>
                                    <CardDescription className="truncate">
                                        {config.host}:{config.port}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                                    <div className="flex justify-between">
                                        <span>User:</span>
                                        <span className="font-medium text-foreground truncate max-w-[150px]">{config.username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sender:</span>
                                        <span className="font-medium text-foreground truncate max-w-[150px]">{config.fromEmail}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Secure:</span>
                                        <span className={config.secure ? "text-emerald-600" : "text-amber-600"}>
                                            {config.secure ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6 justify-end border-t pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8"
                                        onClick={() => handleOpenDialog(config)}
                                    >
                                        <Pencil className="mr-2 h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-8"
                                        onClick={() => setConfigToDelete(config)}
                                    >
                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                        Hapus
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {configs.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed rounded-lg text-muted-foreground">
                            <Server className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">Belum ada konfigurasi SMTP</p>
                            <p className="text-sm">Tambahkan konfigurasi baru untuk mulai mengirim email.</p>
                            <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                                Tambah SMTP
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedConfig ? "Edit Konfigurasi SMTP" : "Tambah Konfigurasi SMTP"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedConfig
                                ? "Ubah detail konfigurasi server email Anda."
                                : "Tambahkan akun SMTP baru untuk pengiriman email."}
                        </DialogDescription>
                    </DialogHeader>
                    <SMTPForm
                        initialData={selectedConfig || undefined}
                        onSuccess={handleSuccess}
                        onCancel={handleCloseDialog}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={!!configToDelete} onOpenChange={(open) => !open && setConfigToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Apakah Anda yakin?</DialogTitle>
                        <DialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Konfigurasi <strong>{configToDelete?.name}</strong> akan dihapus permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
