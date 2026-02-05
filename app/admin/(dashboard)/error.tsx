"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>

                {/* Title */}
                <h1 className="mb-3 text-xl font-semibold">
                    Terjadi Kesalahan
                </h1>

                {/* Description */}
                <p className="mb-2 text-sm text-muted-foreground">
                    Maaf, terjadi kesalahan saat memuat halaman ini.
                    Silakan coba lagi atau kembali ke dashboard.
                </p>

                {/* Error digest */}
                {error.digest && (
                    <p className="mb-6 text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded inline-block">
                        {error.digest}
                    </p>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center mt-6">
                    <Button onClick={reset} size="sm">
                        <RefreshCw className="h-4 w-4" />
                        Coba Lagi
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin">
                            <Home className="h-4 w-4" />
                            Dashboard
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Button>
                </div>
            </div>
        </div>
    );
}
