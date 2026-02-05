"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to console (bisa diganti dengan logging service)
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>

                {/* Title */}
                <h1 className="mb-3 text-2xl font-semibold">
                    Terjadi Kesalahan
                </h1>

                {/* Description */}
                <p className="mb-2 text-muted-foreground">
                    Maaf, terjadi kesalahan saat memproses permintaan Anda.
                    Silakan coba lagi atau hubungi tim support jika masalah berlanjut.
                </p>

                {/* Error digest for debugging */}
                {error.digest && (
                    <p className="mb-6 text-xs text-muted-foreground font-mono">
                        Kode Error: {error.digest}
                    </p>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button onClick={reset}>
                        <RefreshCw className="h-4 w-4" />
                        Coba Lagi
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            Ke Halaman Utama
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <p className="mt-12 text-sm text-muted-foreground">
                Jika masalah berlanjut, silakan{" "}
                <Link href="/" className="text-primary hover:underline">
                    hubungi tim support
                </Link>
            </p>
        </div>
    );
}
