"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { saveVerifiedTicket } from "@/lib/public-ticket-session";
import type { PublicTicket } from "@/types/public-ticket";

export default function HomePage() {
    const router = useRouter();
    const [ticketId, setTicketId] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!ticketId.trim()) {
            setError("Nomor tiket harus diisi");
            return;
        }

        if (!email.trim()) {
            setError("Email harus diisi");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/public/tickets/lookup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ticketNumber: ticketId.trim().toUpperCase(),
                    email: email.trim().toLowerCase(),
                }),
            });

            const data = await res.json();

            if (res.ok && data.ticket) {
                // Save to session and redirect
                saveVerifiedTicket(
                    ticketId.trim().toUpperCase(),
                    email.trim().toLowerCase(),
                    data.ticket as PublicTicket
                );
                router.push(`/ticket/${data.ticket.ticketNumber}`);
            } else {
                setError(data.error || "Tiket tidak ditemukan atau email tidak cocok");
            }
        } catch (err) {
            console.error("Lookup error:", err);
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Hero Section */}
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                        <svg
                            className="h-8 w-8 text-primary-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold sm:text-3xl">Cek Status Tiket</h1>
                    <p className="mt-2 text-muted-foreground">
                        Masukkan nomor tiket dan email untuk melihat status tiket Anda
                    </p>
                </div>

                {/* Track Form */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Verifikasi Tiket</CardTitle>
                        <CardDescription>
                            Pastikan nomor tiket dan email sesuai dengan data yang terdaftar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ticketId">Nomor Tiket</Label>
                                <Input
                                    id="ticketId"
                                    placeholder="Contoh: TKT-ABC123"
                                    value={ticketId}
                                    onChange={(e) => {
                                        setTicketId(e.target.value.toUpperCase());
                                        setError("");
                                    }}
                                    className="font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@contoh.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                    }}
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="mr-2 h-4 w-4 animate-spin"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Memverifikasi...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                        Cek Status
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Help Text */}
                <div className="mt-6 rounded-lg border bg-muted/30 p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <svg
                            className="h-4 w-4 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        Tidak menemukan nomor tiket?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Nomor tiket dapat ditemukan di email konfirmasi atau dokumen tiket yang diberikan saat pembuatan tiket.
                    </p>
                </div>
            </div>
        </div>
    );
}
