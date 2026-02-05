"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

interface StalledTicketsListProps {
    count: number;
}

export function StalledTicketsList({ count }: StalledTicketsListProps) {
    if (count === 0) return null;

    return (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                        <CardTitle className="text-base text-amber-900 dark:text-amber-100">
                            Perhatian Diperlukan: Tiket Mangkrak
                        </CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                        {count} Tiket
                    </Badge>
                </div>
                <CardDescription className="text-amber-700/80 dark:text-amber-300/80">
                    Tiket status "In Progress" tanpa update lebih dari 3 hari.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Potensi SLA Breach jika dibiarkan</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800 hover:bg-amber-100" asChild>
                        <Link href="/admin/tickets?status=in_progress&sort=updated_asc">
                            Lihat Semua <ExternalLink className="ml-2 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
