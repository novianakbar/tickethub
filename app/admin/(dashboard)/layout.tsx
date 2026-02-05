"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, Loader2 } from "lucide-react";

function GlobalHeader() {
    const { data: session, status } = useSession();

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/admin/login" });
    };

    // Get user initials from name
    const getInitials = (name: string | null | undefined): string => {
        if (!name) return "??";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const initials = getInitials(session?.user?.name);
    const userName = session?.user?.name || "Pengguna";
    const userEmail = session?.user?.email || "";

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-end px-6">
                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                                {status === "loading" ? (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                                        {initials}
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{userName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {userEmail}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/admin/settings">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Pengaturan
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Keluar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <SidebarProvider>
                <div className="flex min-h-screen">
                    <AdminSidebar />
                    <div className="flex flex-1 flex-col">
                        <GlobalHeader />
                        <main className="flex-1 overflow-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </SidebarProvider>
            <Toaster />
        </AuthProvider>
    );
}
