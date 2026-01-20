"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Send } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const smtpSchema = z.object({
    name: z.string().min(1, "Nama konfigurasi harus diisi"),
    host: z.string().min(1, "Host SMTP harus diisi"),
    port: z.coerce.number().int().positive("Port harus berupa angka positif"),
    secure: z.boolean(),
    username: z.string().min(1, "Username harus diisi"),
    password: z.string().min(1, "Password harus diisi"),
    fromName: z.string().min(1, "Nama pengirim harus diisi"),
    fromEmail: z.string().email("Email tidak valid"),
    isDefault: z.boolean(),
});

export type SMTPFormValues = z.infer<typeof smtpSchema>;

interface SMTPFormProps {
    initialData?: SMTPFormValues & { id: string };
    onSuccess: () => void;
    onCancel: () => void;
}

const SMTP_PROVIDERS = [
    { name: "Gmail", host: "smtp.gmail.com", port: 587, secure: false }, // TLS/STARTTLS
    { name: "Outlook / Office 365", host: "smtp.office365.com", port: 587, secure: false },
    { name: "SendGrid", host: "smtp.sendgrid.net", port: 587, secure: false },
    { name: "Mailgun", host: "smtp.mailgun.org", port: 587, secure: false },
    { name: "Amazon SES", host: "email-smtp.us-east-1.amazonaws.com", port: 587, secure: false },
    { name: "Zoho Mail", host: "smtp.zoho.com", port: 465, secure: true },
    { name: "Custom", host: "", port: 587, secure: false },
];

export function SMTPForm({ initialData, onSuccess, onCancel }: SMTPFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Test Connection State
    const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testEmail, setTestEmail] = useState("");

    const form = useForm<SMTPFormValues>({
        resolver: zodResolver(smtpSchema) as any,
        defaultValues: initialData || {
            name: "",
            host: "",
            port: 587,
            secure: false,
            username: "",
            password: "",
            fromName: "",
            fromEmail: "",
            isDefault: false,
        },
    });

    const handleProviderChange = (value: string) => {
        const provider = SMTP_PROVIDERS.find((p) => p.name === value);
        if (provider && provider.name !== "Custom") {
            form.setValue("host", provider.host);
            form.setValue("port", provider.port);
            form.setValue("secure", provider.secure);

            // If name is empty, autofill it too
            if (!form.getValues("name")) {
                form.setValue("name", provider.name);
            }
        }
    };

    const handleTestConnection = async () => {
        if (!testEmail) {
            toast.error("Email tujuan tes harus diisi");
            return;
        }

        const config = form.getValues();
        // Basic validation before test
        if (!config.host || !config.username || !config.password) {
            toast.error("Mohon lengkapi konfigurasi Host, Username, dan Password");
            setIsTestDialogOpen(false);
            return;
        }

        setIsTesting(true);
        try {
            const res = await fetch("/api/settings/smtp/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ config, to: testEmail }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal mengirim email tes");
            }

            toast.success("Koneksi berhasil! Email tes telah dikirim.");
            setIsTestDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Gagal melakukan tes koneksi");
        } finally {
            setIsTesting(false);
        }
    };

    const onSubmit = async (data: SMTPFormValues) => {
        setIsLoading(true);
        try {
            if (initialData) {
                // Update
                const res = await fetch(`/api/settings/smtp/${initialData.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "Failed to update");
                }
                toast.success("Konfigurasi SMTP berhasil diperbarui");
            } else {
                // Create
                const res = await fetch("/api/settings/smtp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "Failed to create");
                }
                toast.success("Konfigurasi SMTP berhasil dibuat");
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "Terjadi kesalahan saat menyimpan konfigurasi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="h-[400px] overflow-y-auto pr-4">

                    <div className="mb-4">
                        <FormLabel className="mb-2 block">Pilih Provider (Auto-fill)</FormLabel>
                        <Select onValueChange={handleProviderChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih provider untuk isi otomatis" />
                            </SelectTrigger>
                            <SelectContent>
                                {SMTP_PROVIDERS.map((provider) => (
                                    <SelectItem key={provider.name} value={provider.name}>
                                        {provider.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="mb-4">
                                <FormLabel>Nama Konfigurasi</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: Email Support Utama" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormField
                            control={form.control}
                            name="host"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SMTP Host</FormLabel>
                                    <FormControl>
                                        <Input placeholder="smtp.example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="port"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SMTP Port</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="587" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="******"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormField
                            control={form.control}
                            name="fromName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Pengirim</FormLabel>
                                    <FormControl>
                                        <Input placeholder="TicketHub Support" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fromEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Pengirim</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="support@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4 rounded-lg border p-4 mb-2">
                        <FormField
                            control={form.control}
                            name="secure"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm">Secure (SSL/TLS)</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isDefault"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm">Jadikan Default</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-between gap-2 pt-2 border-t mt-4">
                    <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="secondary">
                                <Send className="mr-2 h-4 w-4" />
                                Tes Koneksi
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Tes Koneksi SMTP</DialogTitle>
                                <DialogDescription>
                                    Kirim email tes untuk memvalidasi konfigurasi.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="testEmail">
                                        Email Tujuan
                                    </Label>
                                    <Input
                                        id="testEmail"
                                        placeholder="user@example.com"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        type="email"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="sm:justify-end">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">
                                        Batal
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="button"
                                    onClick={handleTestConnection}
                                    disabled={isTesting}
                                >
                                    {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isTesting ? "Mengirim..." : "Kirim Tes"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
