"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";

export function AgentQuickActions() {
    const { data: session } = useSession();
    const userRole = session?.user?.role;
    const userLevel = session?.user?.level;

    // Check permission
    const canCreate = userRole === "admin" || userLevel?.canCreateTicket;

    return (
        <div className="flex gap-3 flex-wrap">
            {canCreate && (
                <Button asChild>
                    <Link href="/admin/tickets/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Tiket Baru
                    </Link>
                </Button>
            )}
            <Button asChild variant="outline">
                <Link href="/admin/tickets?assigneeId=me">
                    Lihat Tiket Saya
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/admin/tickets">
                    Semua Tiket
                </Link>
            </Button>
        </div>
    );
}
