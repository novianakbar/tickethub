"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-context";
import { useSidebar } from "@/components/layout/SidebarContext";
import {
    LogOut,
    Loader2,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Ticket,
    Plus,
    Tags,
    Paperclip,
    Users,
    Layers,
    FileText,
    Settings,
    Mail,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
    title: string;
    href: string;
    icon: React.ReactNode;
    adminOnly?: boolean; // RBAC flag
}

const navItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
        title: "Tiket",
        href: "/admin/tickets",
        icon: <Ticket className="h-5 w-5" />,
    },
    {
        title: "Buat Tiket",
        href: "/admin/tickets/new",
        icon: <Plus className="h-5 w-5" />,
    },
    {
        title: "Kategori",
        href: "/admin/categories",
        adminOnly: true,
        icon: <Tags className="h-5 w-5" />,
    },
    {
        title: "Attachment",
        href: "/admin/attachments",
        adminOnly: true,
        icon: <Paperclip className="h-5 w-5" />,
    },
    {
        title: "Pengguna",
        href: "/admin/users",
        adminOnly: true,
        icon: <Users className="h-5 w-5" />,
    },
    {
        title: "Support Level",
        href: "/admin/support-levels",
        adminOnly: true,
        icon: <Layers className="h-5 w-5" />,
    },
    {
        title: "Template",
        href: "/admin/templates",
        adminOnly: true,
        icon: <FileText className="h-5 w-5" />,
    },
    {
        title: "Pengaturan",
        href: "/admin/settings",
        adminOnly: false,
        icon: <Settings className="h-5 w-5" />,
    },
    {
        title: "Email Templates",
        href: "/admin/email-templates",
        adminOnly: true,
        icon: <Mail className="h-5 w-5" />,
    },
];


export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, isLoading, signOut, isAdmin, level } = useAuth();
    const { collapsed, toggleSidebar } = useSidebar();

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
        <aside
            className={cn(
                "relative hidden shrink-0 border-r bg-card lg:flex lg:flex-col transition-all duration-300 h-screen sticky top-0",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className={cn(
                    "flex h-16 items-center border-b",
                    collapsed ? "justify-center px-2" : "gap-2.5 px-4"
                )}>
                    {!collapsed && (
                        <>
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                                <Ticket className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="font-semibold">TicketHub</span>
                                <p className="text-xs text-muted-foreground">Admin Panel</p>
                            </div>
                        </>
                    )}
                    {/* Toggle button */}
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                            collapsed ? "" : "ml-auto"
                        )}
                        title={collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
                    >
                        {collapsed ? (
                            <ChevronRight className="h-5 w-5" />
                        ) : (
                            <ChevronLeft className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                    {navItems
                        .filter((item) => {
                            // RBAC: Admin-only pages
                            if (item.adminOnly && !isAdmin) return false;

                            // Permission: Buat Tiket requires canCreateTicket
                            if (item.href === "/admin/tickets/new") {
                                return isAdmin || level?.canCreateTicket;
                            }

                            return true;
                        })
                        .map((item) => {
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

                            const linkContent = (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center rounded-lg text-sm font-medium transition-colors",
                                        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    {!collapsed && <span>{item.title}</span>}
                                </Link>
                            );

                            if (collapsed) {
                                return (
                                    <Tooltip key={item.href}>
                                        <TooltipTrigger asChild>
                                            {linkContent}
                                        </TooltipTrigger>
                                        <TooltipContent side="right" sideOffset={10}>
                                            {item.title}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return linkContent;
                        })}
                </nav>

                {/* User Section - Sticky at bottom */}
                <div className={cn("border-t", collapsed ? "p-2" : "p-4")}>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : profile ? (
                        <div className={cn("space-y-2", collapsed && "space-y-3")}>
                            {collapsed ? (
                                // Collapsed: Show avatar with tooltip
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center justify-center rounded-lg bg-muted/50 p-2 cursor-default">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                                {getInitials()}
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={10}>
                                        <div>
                                            <p className="font-medium">{profile.fullName || profile.email}</p>
                                            <p className="text-xs text-muted-foreground">{getRoleBadge()}</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                // Expanded: Show full profile
                                <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                                        {getInitials()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {profile.fullName || profile.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {getRoleBadge()}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {collapsed ? (
                                // Collapsed: Icon only logout button with tooltip
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={10}>
                                        Keluar
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                // Expanded: Full logout button
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Keluar
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={cn(
                            "flex items-center rounded-lg bg-muted/50",
                            collapsed ? "justify-center p-2" : "gap-3 px-3 py-2"
                        )}>
                            <div className={cn(
                                "flex items-center justify-center rounded-full bg-muted text-sm font-medium",
                                collapsed ? "h-8 w-8 text-xs" : "h-9 w-9"
                            )}>
                                ??
                            </div>
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-muted-foreground truncate">Not logged in</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
