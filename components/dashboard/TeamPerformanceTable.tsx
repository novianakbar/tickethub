"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Users, Clock } from "lucide-react";
import type { TeamPerformance } from "@/types/dashboard";
import { getLevelClassName } from "@/lib/ticket-config";

interface TeamPerformanceTableProps {
    data: TeamPerformance[];
    className?: string;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function formatResolutionTime(hours: number | null): string {
    if (hours === null) return "-";
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}j`;
    return `${(hours / 24).toFixed(1)}h`;
}

export function TeamPerformanceTable({ data, className }: TeamPerformanceTableProps) {
    if (data.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        Performa Tim
                    </CardTitle>
                    <CardDescription>Statistik kinerja agent</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-sm">
                            Belum ada data agent
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Sort by resolved count descending
    const sortedData = [...data].sort((a, b) => b.resolvedCount - a.resolvedCount);

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    Performa Tim
                </CardTitle>
                <CardDescription>Statistik kinerja agent</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Agent</TableHead>
                            <TableHead className="text-center">Level</TableHead>
                            <TableHead className="text-center">Open</TableHead>
                            <TableHead className="text-center">Proses</TableHead>
                            <TableHead className="text-center">Selesai</TableHead>
                            <TableHead className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Avg.</span>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.map((agent) => (
                            <TableRow key={agent.agentId}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(agent.agentName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {agent.agentName}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                {agent.agentEmail}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge
                                        variant="outline"
                                        className={cn("text-xs", getLevelClassName(agent.level.code))}
                                    >
                                        {agent.level.code}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className={cn(
                                        "font-medium",
                                        agent.openCount > 5 && "text-orange-600 dark:text-orange-400"
                                    )}>
                                        {agent.openCount}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                        {agent.inProgressCount}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                        {agent.resolvedCount}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="text-sm text-muted-foreground">
                                        {formatResolutionTime(agent.avgResolutionHours)}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
