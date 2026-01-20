"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Settings, LogOut } from "lucide-react";

function GlobalHeader() {
    const router = useRouter();

    const handleLogout = () => {
        router.push("/admin/login");
    };

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-end px-6">
                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                                    AD
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">Admin User</p>
                                    <p className="text-xs text-muted-foreground">
                                        admin@contoh.com
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
