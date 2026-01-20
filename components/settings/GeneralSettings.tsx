"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GeneralSettingsData {
    siteName: string;
    supportEmail: string;
    companyName: string;
    autoCloseDays: string;
    emailCustomerEnabled: string;
}

export function GeneralSettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [settings, setSettings] = useState<GeneralSettingsData>({
        siteName: "TicketHub",
        supportEmail: "support@example.com",
        companyName: "TicketHub Inc.",
        autoCloseDays: "7",
        emailCustomerEnabled: "true",
    });

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch("/api/settings/general");
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Gagal mengambil pengaturan");
            } finally {
                setIsFetching(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSaveSettings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/settings/general", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                const data = await response.json();
                setSettings(data);
                toast.success("Pengaturan berhasil disimpan");
            } else {
                throw new Error("Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Gagal menyimpan pengaturan");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Pengaturan Umum</CardTitle>
                <CardDescription>
                    Konfigurasi dasar sistem
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Basic Settings */}
                <div className="space-y-4">
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
                        <Label htmlFor="companyName">Nama Perusahaan</Label>
                        <Input
                            id="companyName"
                            value={settings.companyName}
                            onChange={(e) =>
                                setSettings({ ...settings, companyName: e.target.value })
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
                        <Label htmlFor="autoCloseDays">Auto-close Tiket (hari)</Label>
                        <Input
                            id="autoCloseDays"
                            type="number"
                            min="1"
                            value={settings.autoCloseDays}
                            onChange={(e) =>
                                setSettings({ ...settings, autoCloseDays: e.target.value })
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            Tiket dengan status Selesai akan otomatis ditutup setelah jumlah hari ini
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Email Notification Settings */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium">Notifikasi Email</h4>
                        <p className="text-xs text-muted-foreground">
                            Pengaturan pengiriman email notifikasi
                        </p>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="emailCustomerEnabled" className="text-sm font-medium">
                                Email ke Customer
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Kirim email notifikasi ke customer saat ada update tiket
                            </p>
                        </div>
                        <Switch
                            id="emailCustomerEnabled"
                            checked={settings.emailCustomerEnabled === "true"}
                            onCheckedChange={(checked) =>
                                setSettings({
                                    ...settings,
                                    emailCustomerEnabled: checked ? "true" : "false",
                                })
                            }
                        />
                    </div>
                </div>

                <Button onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        "Simpan Perubahan"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
