"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to console
        console.error("Global error:", error);
    }, [error]);

    return (
        <html lang="id">
            <body>
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        backgroundColor: "#fafafa",
                    }}
                >
                    <div style={{ textAlign: "center", maxWidth: "400px" }}>
                        {/* Icon */}
                        <div
                            style={{
                                width: "96px",
                                height: "96px",
                                borderRadius: "50%",
                                backgroundColor: "#fef2f2",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "1.5rem",
                            }}
                        >
                            <AlertTriangle
                                style={{ width: "48px", height: "48px", color: "#dc2626" }}
                            />
                        </div>

                        {/* Title */}
                        <h1
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "600",
                                marginBottom: "0.75rem",
                                color: "#111827",
                            }}
                        >
                            Terjadi Kesalahan Sistem
                        </h1>

                        {/* Description */}
                        <p
                            style={{
                                color: "#6b7280",
                                marginBottom: "0.5rem",
                            }}
                        >
                            Maaf, terjadi kesalahan yang tidak terduga.
                            Tim kami telah diberitahu dan sedang menangani masalah ini.
                        </p>

                        {/* Error digest */}
                        {error.digest && (
                            <p
                                style={{
                                    fontSize: "0.75rem",
                                    color: "#9ca3af",
                                    fontFamily: "monospace",
                                    marginBottom: "1.5rem",
                                }}
                            >
                                Kode: {error.digest}
                            </p>
                        )}

                        {/* Actions */}
                        <div
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                justifyContent: "center",
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                onClick={reset}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.75rem 1.25rem",
                                    backgroundColor: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "0.5rem",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                }}
                            >
                                <RefreshCw style={{ width: "16px", height: "16px" }} />
                                Coba Lagi
                            </button>
                            <a
                                href="/"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.75rem 1.25rem",
                                    backgroundColor: "white",
                                    color: "#374151",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "0.5rem",
                                    fontWeight: "500",
                                    textDecoration: "none",
                                    fontSize: "0.875rem",
                                }}
                            >
                                <Home style={{ width: "16px", height: "16px" }} />
                                Ke Halaman Utama
                            </a>
                        </div>
                    </div>

                    {/* Footer */}
                    <p
                        style={{
                            marginTop: "3rem",
                            fontSize: "0.875rem",
                            color: "#9ca3af",
                        }}
                    >
                        Jika masalah berlanjut, silakan{" "}
                        <a href="/" style={{ color: "#3b82f6" }}>
                            hubungi tim support
                        </a>
                    </p>
                </div>
            </body>
        </html>
    );
}
