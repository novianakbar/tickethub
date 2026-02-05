"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                    <FileQuestion className="h-12 w-12 text-muted-foreground" />
                </div>

                {/* Error Code */}
                <h1 className="mb-2 text-8xl font-bold text-primary">404</h1>

                {/* Title */}
                <h2 className="mb-3 text-2xl font-semibold">
                    Halaman Tidak Ditemukan
                </h2>

                {/* Description */}
                <p className="mb-8 text-muted-foreground">
                    Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
                    Silakan periksa URL atau kembali ke halaman utama.
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild>
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            Ke Halaman Utama
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <p className="mt-12 text-sm text-muted-foreground">
                Butuh bantuan?{" "}
                <Link href="/" className="text-primary hover:underline">
                    Hubungi Support
                </Link>
            </p>
        </div>
    );
}
