"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);

    const [settings, setSettings] = useState({
        siteName: "TicketHub",
        supportEmail: "support@contoh.com",
        autoClosedays: "7",
    });

    const handleSaveSettings = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success("Pengaturan berhasil disimpan");
        setIsLoading(false);
    };

    return (
        <>
            <AdminHeader
                title="Pengaturan"
                description="Kelola pengaturan sistem"
            />

            <div className="flex-1 overflow-auto p-6">
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Pengaturan Umum</CardTitle>
                        <CardDescription>
                            Konfigurasi dasar sistem
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="siteName">Nama Situs</Label>
                            <Input
                                id="siteName"
                                value={settings.siteName}
                                onChange={(e) =>
                                    setSettings({ ...settings, siteName: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supportEmail">Email Support</Label>
                            <Input
                                id="supportEmail"
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) =>
                                    setSettings({ ...settings, supportEmail: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="autoClosedays">Auto-close Tiket (hari)</Label>
                            <Input
                                id="autoClosedays"
                                type="number"
                                min="1"
                                value={settings.autoClosedays}
                                onChange={(e) =>
                                    setSettings({ ...settings, autoClosedays: e.target.value })
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Tiket dengan status Selesai akan otomatis ditutup setelah jumlah hari ini
                            </p>
                        </div>

                        <Button onClick={handleSaveSettings} disabled={isLoading}>
                            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
