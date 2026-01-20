"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { SMTPList } from "@/components/settings/SMTPList";
import { SLASettings } from "@/components/settings/SLASettings";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { useAuth } from "@/components/auth/auth-context";

export default function AdminSettingsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    return (
        <div className="flex-1 p-6">
            <PageHeader
                title="Pengaturan"
                description="Kelola pengaturan sistem dan konfigurasi akun"
            />

            <Tabs defaultValue="account" className="space-y-6">
                <TabsList>
                    {isAdmin && (
                        <>
                            <TabsTrigger value="general">Umum</TabsTrigger>
                            <TabsTrigger value="smtp">SMTP</TabsTrigger>
                            <TabsTrigger value="sla">SLA</TabsTrigger>
                        </>
                    )}
                    <TabsTrigger value="account">Akun</TabsTrigger>
                    <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
                </TabsList>

                {isAdmin && (
                    <>
                        <TabsContent value="general">
                            <div className="max-w-2xl">
                                <GeneralSettings />
                            </div>
                        </TabsContent>

                        <TabsContent value="smtp">
                            <SMTPList />
                        </TabsContent>

                        <TabsContent value="sla">
                            <div className="max-w-2xl">
                                <SLASettings />
                            </div>
                        </TabsContent>
                    </>
                )}

                <TabsContent value="account">
                    <AccountSettings />
                </TabsContent>

                <TabsContent value="notifications">
                    <div className="max-w-2xl">
                        <NotificationPreferences />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
