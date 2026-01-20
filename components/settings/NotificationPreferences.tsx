"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Bell, Mail, Clock, ArrowRightLeft, MessageSquare } from "lucide-react";

interface NotificationPreferences {
  notifyOnAssigned: boolean;
  notifyOnCustomerReply: boolean;
  notifySlaWarning: boolean;
  notifyTicketProgress: boolean;
  notifyOnUnassigned: boolean;
}

const preferenceItems = [
  {
    key: "notifyOnAssigned" as const,
    label: "Ticket Ditugaskan",
    description: "Terima email saat ada ticket baru yang ditugaskan ke Anda",
    icon: Bell,
  },
  {
    key: "notifyOnCustomerReply" as const,
    label: "Balasan Customer",
    description: "Terima email saat customer membalas ticket yang Anda tangani",
    icon: MessageSquare,
  },
  {
    key: "notifySlaWarning" as const,
    label: "Peringatan SLA",
    description: "Terima email peringatan saat batas waktu SLA hampir tercapai",
    icon: Clock,
  },
  {
    key: "notifyTicketProgress" as const,
    label: "Progress Ticket",
    description: "Terima email update progress untuk ticket yang Anda buat",
    icon: Mail,
  },
  {
    key: "notifyOnUnassigned" as const,
    label: "Ticket Dialihkan",
    description: "Terima email saat ticket dialihkan dari Anda ke agent lain",
    icon: ArrowRightLeft,
  },
];

export function NotificationPreferences() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    notifyOnAssigned: true,
    notifyOnCustomerReply: true,
    notifySlaWarning: true,
    notifyTicketProgress: true,
    notifyOnUnassigned: true,
  });

  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/users/me/preferences");
        if (response.ok) {
          const data = await response.json();
          setPreferences(data.preferences);
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
        toast.error("Gagal mengambil pengaturan notifikasi");
      } finally {
        setIsFetching(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newValue = !preferences[key];
    
    // Optimistic update
    setPreferences((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    try {
      const response = await fetch("/api/users/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preference");
      }

      toast.success("Pengaturan berhasil disimpan");
    } catch (error) {
      // Revert on error
      setPreferences((prev) => ({
        ...prev,
        [key]: !newValue,
      }));
      console.error("Error updating preference:", error);
      toast.error("Gagal menyimpan pengaturan");
    }
  };

  const handleEnableAll = async () => {
    setIsLoading(true);
    try {
      const allEnabled = {
        notifyOnAssigned: true,
        notifyOnCustomerReply: true,
        notifySlaWarning: true,
        notifyTicketProgress: true,
        notifyOnUnassigned: true,
      };

      const response = await fetch("/api/users/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allEnabled),
      });

      if (response.ok) {
        setPreferences(allEnabled);
        toast.success("Semua notifikasi diaktifkan");
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      console.error("Error enabling all:", error);
      toast.error("Gagal mengaktifkan semua notifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableAll = async () => {
    setIsLoading(true);
    try {
      const allDisabled = {
        notifyOnAssigned: false,
        notifyOnCustomerReply: false,
        notifySlaWarning: false,
        notifyTicketProgress: false,
        notifyOnUnassigned: false,
      };

      const response = await fetch("/api/users/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allDisabled),
      });

      if (response.ok) {
        setPreferences(allDisabled);
        toast.success("Semua notifikasi dinonaktifkan");
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      console.error("Error disabling all:", error);
      toast.error("Gagal menonaktifkan semua notifikasi");
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
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Notifikasi Email
        </CardTitle>
        <CardDescription>
          Pilih jenis notifikasi email yang ingin Anda terima
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnableAll}
            disabled={isLoading}
          >
            Aktifkan Semua
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisableAll}
            disabled={isLoading}
          >
            Nonaktifkan Semua
          </Button>
        </div>

        {/* Preference Items */}
        <div className="space-y-4">
          {preferenceItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-muted p-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-0.5">
                    <Label
                      htmlFor={item.key}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {item.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={item.key}
                  checked={preferences[item.key]}
                  onCheckedChange={() => handleToggle(item.key)}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
