"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Plus,
    Users,
    Tag,
    Shield,
    UserX,
    Settings,
    BarChart3
} from "lucide-react";

interface AdminQuickActionsProps {
    unassignedCount?: number;
    className?: string;
}

interface QuickActionItem {
    href: string;
    label: string;
    description: string;
    icon: typeof Plus;
    variant?: "default" | "outline" | "secondary";
    badge?: number;
}

export function AdminQuickActions({ unassignedCount = 0, className }: AdminQuickActionsProps) {
    const actions: QuickActionItem[] = [
        {
            href: "/admin/tickets/new",
            label: "Buat Tiket",
            description: "Buat tiket baru",
            icon: Plus,
            variant: "default",
        },
        {
            href: "/admin/tickets?assigneeId=unassigned",
            label: "Unassigned",
            description: "Tiket belum ditugaskan",
            icon: UserX,
            variant: "outline",
            badge: unassignedCount,
        },
        {
            href: "/admin/users",
            label: "Pengguna",
            description: "Kelola pengguna",
            icon: Users,
            variant: "outline",
        },
        {
            href: "/admin/categories",
            label: "Kategori",
            description: "Kelola kategori",
            icon: Tag,
            variant: "outline",
        },
        {
            href: "/admin/support-levels",
            label: "Support Level",
            description: "Kelola level",
            icon: Shield,
            variant: "outline",
        },
        {
            href: "/admin/settings",
            label: "Pengaturan",
            description: "Pengaturan sistem",
            icon: Settings,
            variant: "outline",
        },
    ];

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    Aksi Cepat
                </CardTitle>
                <CardDescription>
                    Akses cepat ke fitur admin
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {actions.map((action) => (
                        <Button
                            key={action.href}
                            asChild
                            variant={action.variant}
                            className="h-auto flex-col gap-1 py-3 px-3 relative"
                        >
                            <Link href={action.href}>
                                <action.icon className="h-5 w-5" />
                                <span className="text-xs font-medium">{action.label}</span>
                                {action.badge !== undefined && action.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                                        {action.badge > 99 ? "99+" : action.badge}
                                    </span>
                                )}
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
