"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TicketFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
    priorityFilter: string;
    onPriorityChange: (value: string) => void;
    levelFilter: string;
    onLevelChange: (value: string) => void;
    children?: React.ReactNode;
}

const levelTabs = [
    { value: "all", label: "Semua", color: "" },
    { value: "L0", label: "L0", color: "data-[active=true]:border-gray-500" },
    { value: "L1", label: "L1", color: "data-[active=true]:border-blue-500" },
    { value: "L2", label: "L2", color: "data-[active=true]:border-orange-500" },
    { value: "L3", label: "L3", color: "data-[active=true]:border-purple-600" },
];

export function TicketFilters({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    priorityFilter,
    onPriorityChange,
    levelFilter,
    onLevelChange,
    children,
}: TicketFiltersProps) {
    return (
        <div className="mb-6 space-y-4">
            {/* Level Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {levelTabs.map((tab) => (
                    <Button
                        key={tab.value}
                        variant={levelFilter === tab.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => onLevelChange(tab.value)}
                        className={cn(
                            "shrink-0",
                            levelFilter === tab.value && tab.color
                        )}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <svg
                                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <Input
                                placeholder="Cari tiket, pelanggan, atau ID..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2">
                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={onStatusChange}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="open">Menunggu</SelectItem>
                                    <SelectItem value="in_progress">Diproses</SelectItem>
                                    <SelectItem value="resolved">Selesai</SelectItem>
                                    <SelectItem value="closed">Ditutup</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Priority Filter */}
                            <Select value={priorityFilter} onValueChange={onPriorityChange}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Prioritas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Prioritas</SelectItem>
                                    <SelectItem value="high">Prioritas</SelectItem>
                                    <SelectItem value="medium">Sedang</SelectItem>
                                    <SelectItem value="low">Normal</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Additional Actions */}
                            {children}
                        </div>
                    </div>

                    {/* Active Filters Indicator */}
                    {(statusFilter !== "all" || priorityFilter !== "all" || levelFilter !== "all") && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">Filter aktif:</span>
                            {levelFilter !== "all" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                                    Level: {levelFilter}
                                    <button
                                        onClick={() => onLevelChange("all")}
                                        className="ml-1 hover:text-destructive"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {statusFilter !== "all" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                                    Status: {statusFilter === "in_progress" ? "Diproses" : statusFilter === "open" ? "Menunggu" : statusFilter === "resolved" ? "Selesai" : "Ditutup"}
                                    <button
                                        onClick={() => onStatusChange("all")}
                                        className="ml-1 hover:text-destructive"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {priorityFilter !== "all" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                                    Prioritas: {priorityFilter === "high" ? "Tinggi" : priorityFilter === "medium" ? "Sedang" : "Normal"}
                                    <button
                                        onClick={() => onPriorityChange("all")}
                                        className="ml-1 hover:text-destructive"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    onLevelChange("all");
                                    onStatusChange("all");
                                    onPriorityChange("all");
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Hapus semua
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
