"use client";

import Link from "next/link";
import { Ticket } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Ticket className="h-5 w-5 text-primary-foreground" />
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
