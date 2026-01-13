"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-context";
import { LogOut, Loader2 } from "lucide-react";

const navItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        title: "Tiket",
        href: "/admin/tickets",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
        ),
    },
    {
        title: "Buat Tiket",
        href: "/admin/tickets/new",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        ),
    },
    {
        title: "Kategori",
        href: "/admin/categories",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
        ),
    },
    {
        title: "Pengguna",
        href: "/admin/users",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20H4v-2a4 4 0 013-3.87" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 8a6 6 0 11-12 0 6 6 0 0112 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
        ),
    },
    {
        title: "Support Level",
        href: "/admin/support-levels",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
    },
    {
        title: "Pengaturan",
        href: "/admin/settings",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, isLoading, signOut, isAdmin, level } = useAuth();

    const handleLogout = async () => {
        await signOut();
        router.push("/admin/login");
        router.refresh();
    };

    // Get initials from name or email
    const getInitials = () => {
        if (profile?.fullName) {
            return profile.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        if (profile?.email) {
            return profile.email.slice(0, 2).toUpperCase();
        }
        return "??";
    };

    // Get role badge text
    const getRoleBadge = () => {
        if (isAdmin) return "Admin";
        return `Agent ${level?.code ?? ""}`;
    };

    return (
        <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center gap-2.5 border-b px-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <svg
                            className="h-4 w-4 text-primary-foreground"
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
                        <span className="font-semibold">TicketHub</span>
                        <p className="text-xs text-muted-foreground">Admin Panel</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        // Check for exact match or child routes (excluding other nav items)
                        let isActive = false;

                        if (item.href === "/admin") {
                            // Dashboard: only exact match
                            isActive = pathname === "/admin";
                        } else if (item.href === "/admin/tickets") {
                            // Tiket: matches /admin/tickets but not /admin/tickets/new
                            isActive = pathname === "/admin/tickets" ||
                                (pathname.startsWith("/admin/tickets/") && pathname !== "/admin/tickets/new" && !pathname.endsWith("/new"));
                        } else if (item.href === "/admin/tickets/new") {
                            // Buat Tiket: only exact match
                            isActive = pathname === "/admin/tickets/new";
                        } else {
                            // Other items: starts with
                            isActive = pathname.startsWith(item.href);
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {item.icon}
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="border-t p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : profile ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                                    {getInitials()}
                                </div>
                                <div className="flex-1 truncate">
                                    <p className="text-sm font-medium truncate">
                                        {profile.fullName || profile.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {getRoleBadge()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                                <LogOut className="h-4 w-4" />
                                Keluar
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                ??
                            </div>
                            <div className="flex-1 truncate">
                                <p className="text-sm text-muted-foreground">Not logged in</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

