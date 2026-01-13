"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <svg
                            className="h-5 w-5 text-primary-foreground"
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
                    <div>
                        <span className="text-lg font-semibold">TicketHub</span>
                        <p className="text-xs text-muted-foreground">Pelacakan Tiket</p>
                    </div>
                </Link>

                {/* Right Side - Theme Toggle Only */}
                <ThemeToggle />
            </div>
        </header>
    );
}
