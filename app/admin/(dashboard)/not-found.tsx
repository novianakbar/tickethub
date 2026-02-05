"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <FileQuestion className="h-10 w-10 text-muted-foreground" />
                </div>

                {/* Error Code */}
                <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>

                {/* Title */}
                <h2 className="mb-3 text-xl font-semibold">
                    Halaman Tidak Ditemukan
                </h2>

                {/* Description */}
                <p className="mb-6 text-sm text-muted-foreground">
                    Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button size="sm" asChild>
                        <Link href="/admin">
                            <Home className="h-4 w-4" />
                            Dashboard
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Button>
                </div>
            </div>
        </div>
    );
}
