"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2, Ticket, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [identifier, setIdentifier] = useState(""); // email or username
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!identifier.trim() || !password.trim()) {
            setError("Username/email dan password harus diisi");
            return;
        }

        setIsLoading(true);

        try {
            // Lookup email if username provided
            let email = identifier;

            if (!identifier.includes("@")) {
                const lookupRes = await fetch("/api/auth/lookup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier }),
                });

                if (!lookupRes.ok) {
                    const data = await lookupRes.json();
                    setError(data.error === "User not found" ? "Username tidak ditemukan" : data.error);
                    setIsLoading(false);
                    return;
                }

                const { email: foundEmail } = await lookupRes.json();
                email = foundEmail;
            }

            // Login with NextAuth
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
                return;
            }

            router.push("/admin");
            router.refresh();
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-linear-to-br from-background via-background to-muted/50">
            {/* Header */}
            <header className="flex h-14 items-center justify-end px-4">
                <ThemeToggle />
            </header>

            {/* Main Content */}
            <div className="flex flex-1 items-center justify-center px-4">
                <div className="w-full max-w-sm">
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                            <Ticket className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">TicketHub</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Panel Administrasi
                        </p>
                    </div>

                    {/* Login Card */}
                    <Card className="border-0 shadow-xl shadow-black/5">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Masuk</CardTitle>
                            <CardDescription>
                                Gunakan username atau email Anda
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="identifier">Username atau Email</Label>
                                    <Input
                                        id="identifier"
                                        type="text"
                                        placeholder="john.doe atau john@email.com"
                                        value={identifier}
                                        onChange={(e) => {
                                            setIdentifier(e.target.value);
                                            setError("");
                                        }}
                                        autoComplete="username"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError("");
                                        }}
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        "Masuk"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Footer Note */}
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        Jika lupa password, hubungi administrator sistem.
                    </p>
                </div>
            </div>
        </div>
    );
}
