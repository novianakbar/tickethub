"use client";

import { useTicketFilters } from "@/hooks/useTicketFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, User, Tag, BarChart2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { statusOptions, priorityOptions } from "@/lib/ticket-config";

interface TicketFilterToolbarProps {
    levels: { id: string; code: string; name: string }[];
    categories: { id: string; name: string; color: string }[];
}

export function TicketFilterToolbar({ levels, categories }: TicketFilterToolbarProps) {
    const {
        filters,
        setSearch,
        setStatus,
        setPriority,
        setLevel,
        setAssigneeId,
        setCategoryId,
        resetFilters,
        activeFilterCount,
    } = useTicketFilters();

    const [searchInput, setSearchInput] = useState(filters.search);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.search) {
                setSearch(searchInput);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput, setSearch, filters.search]);

    // Sync input with url param if it changes externally
    useEffect(() => {
        setSearchInput(filters.search);
    }, [filters.search]);

    const hasActiveFilters = activeFilterCount > 0;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari tiket, pelanggan, nomor..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9 bg-background"
                    />
                    {searchInput && (
                        <button
                            onClick={() => setSearchInput("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>

                {/* Filter Sheet Trigger (Mobile/Desktop) */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="gap-2 relative">
                            <Filter className="h-4 w-4" />
                            Filter
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem] ml-1">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:w-[540px] overflow-y-auto flex flex-col h-full p-0">
                        <SheetHeader className="border-b p-6 mb-0 space-y-1">
                            <SheetTitle className="text-xl">Filter Tiket</SheetTitle>
                            <SheetDescription>
                                Sesuaikan kriteria pencarian untuk menemukan tiket yang relevan.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="flex-1 py-6 space-y-8 px-6">
                            {/* Section: Status & Priority */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Status & Prioritas</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <BarChart2 className="h-4 w-4 text-primary/70" /> Status
                                        </label>
                                        <Select value={filters.status} onValueChange={setStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Status</SelectItem>
                                                {statusOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-primary/70" /> Prioritas
                                        </label>
                                        <Select value={filters.priority} onValueChange={setPriority}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Prioritas</SelectItem>
                                                {priorityOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border/50" />

                            {/* Section: Distribution */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Distribusi & Kategori</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <BarChart2 className="h-4 w-4 text-primary/70" /> Level
                                        </label>
                                        <Select value={filters.level} onValueChange={setLevel}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Level</SelectItem>
                                                {(levels || []).map((lvl) => (
                                                    <SelectItem key={lvl.id} value={lvl.id}>
                                                        {lvl.code} - {lvl.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-primary/70" /> Kategori
                                        </label>
                                        <Select value={filters.categoryId} onValueChange={setCategoryId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Kategori</SelectItem>
                                                {(categories || []).map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <User className="h-4 w-4 text-primary/70" /> Ditugaskan Ke
                                    </label>
                                    <Select value={filters.assigneeId} onValueChange={setAssigneeId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih Assignee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Assignee</SelectItem>
                                            <SelectItem value="me">Saya (Tiket Saya)</SelectItem>
                                            <SelectItem value="unassigned">Belum Ditugaskan (Unassigned)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <SheetFooter className="border-t p-6 flex-row flex-wrap justify-between items-center sm:justify-between gap-2 mt-auto bg-muted/10">
                            {hasActiveFilters ? (
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                    className="text-muted-foreground hover:text-destructive hover:border-destructive"
                                >
                                    Reset Semua
                                </Button>
                            ) : (
                                <div /> /* Spacer */
                            )}
                            <div className="flex gap-2">
                                <SheetClose asChild>
                                    <Button variant="ghost">Batal</Button>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button type="submit">Terapkan Filter</Button>
                                </SheetClose>
                            </div>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                {/* Quick Filters (Desktop Visible) */}
                <div className="hidden md:flex items-center gap-2">
                    <Select value={filters.status} onValueChange={setStatus}>
                        <SelectTrigger className="w-[140px] bg-background">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            {statusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.assigneeId} onValueChange={setAssigneeId}>
                        <SelectTrigger className="w-[160px] bg-background">
                            <SelectValue placeholder="Assignee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Assignee</SelectItem>
                            <SelectItem value="me">Saya</SelectItem>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetFilters}
                            title="Reset Filter"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Active Filters Display (Mobile/Desktop) */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 text-sm">
                    {filters.status !== "all" && (
                        <Badge variant="secondary" className="gap-1 pl-1 pr-2">
                            Status: {statusOptions.find(o => o.value === filters.status)?.label}
                            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => setStatus("all")} />
                        </Badge>
                    )}
                    {filters.priority !== "all" && (
                        <Badge variant="secondary" className="gap-1 pl-1 pr-2">
                            Prioritas: {priorityOptions.find(o => o.value === filters.priority)?.label}
                            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => setPriority("all")} />
                        </Badge>
                    )}
                    {filters.assigneeId !== "all" && (
                        <Badge variant="secondary" className="gap-1 pl-1 pr-2">
                            Assign: {filters.assigneeId === 'me' ? 'Saya' : filters.assigneeId === 'unassigned' ? 'Unassigned' : 'User Lain'}
                            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => setAssigneeId("all")} />
                        </Badge>
                    )}
                    {filters.categoryId !== "all" && (
                        <Badge variant="secondary" className="gap-1 pl-1 pr-2">
                            Kategori: {categories.find(c => c.id === filters.categoryId)?.name || 'Unknown'}
                            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => setCategoryId("all")} />
                        </Badge>
                    )}
                    {filters.level !== "all" && (
                        <Badge variant="secondary" className="gap-1 pl-1 pr-2">
                            Level: {levels.find(l => l.id === filters.level)?.code || 'Unknown'}
                            <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => setLevel("all")} />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
