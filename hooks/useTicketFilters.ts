"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface TicketFilters {
    search: string;
    status: string;
    priority: string;
    level: string;
    assigneeId: string;
    categoryId: string;
    page: number;
    limit: number;
}

const defaultFilters: TicketFilters = {
    search: "",
    status: "all",
    priority: "all",
    level: "all",
    assigneeId: "all",
    categoryId: "all",
    page: 1,
    limit: 20,
};

export function useTicketFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Parse current filters from URL
    const filters = useMemo((): TicketFilters => {
        return {
            search: searchParams.get("search") || defaultFilters.search,
            status: searchParams.get("status") || defaultFilters.status,
            priority: searchParams.get("priority") || defaultFilters.priority,
            level: searchParams.get("level") || defaultFilters.level,
            assigneeId: searchParams.get("assigneeId") || defaultFilters.assigneeId,
            categoryId: searchParams.get("categoryId") || defaultFilters.categoryId,
            page: parseInt(searchParams.get("page") || String(defaultFilters.page)),
            limit: parseInt(searchParams.get("limit") || String(defaultFilters.limit)),
        };
    }, [searchParams]);

    // Create a query string from a filters object
    const createQueryString = useCallback(
        (newFilters: Partial<TicketFilters>) => {
            const params = new URLSearchParams(searchParams);

            Object.entries(newFilters).forEach(([key, value]) => {
                if (value === undefined || value === null || value === "" || value === "all") {
                    params.delete(key);
                } else {
                    params.set(key, String(value));
                }
            });

            // Reset page to 1 if any filter changes (except page itself)
            const isPageChange = Object.keys(newFilters).length === 1 && "page" in newFilters;
            if (!isPageChange) {
                params.set("page", "1");
            }

            return params.toString();
        },
        [searchParams]
    );

    // Update filters
    const setFilters = useCallback(
        (newFilters: Partial<TicketFilters>) => {
            const queryString = createQueryString(newFilters);
            router.push(`${pathname}?${queryString}`, { scroll: false });
        },
        [router, pathname, createQueryString]
    );

    // Helpers for specific filters
    const setSearch = (search: string) => setFilters({ search });
    const setStatus = (status: string) => setFilters({ status });
    const setPriority = (priority: string) => setFilters({ priority });
    const setLevel = (level: string) => setFilters({ level });
    const setAssigneeId = (assigneeId: string) => setFilters({ assigneeId });
    const setCategoryId = (categoryId: string) => setFilters({ categoryId });
    // setPage receives number, but URL stores string. Hook logic handles it.
    const setPage = (page: number) => setFilters({ page });
    const setLimit = (limit: number) => setFilters({ limit, page: 1 }); // Reset to page 1 when limit changes

    // Reset filters
    const resetFilters = useCallback(() => {
        router.push(pathname, { scroll: false });
    }, [router, pathname]);

    // Derived active filter count (excluding default values)
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.status !== "all") count++;
        if (filters.priority !== "all") count++;
        if (filters.level !== "all") count++;
        if (filters.assigneeId !== "all") count++;
        if (filters.categoryId !== "all") count++;
        if (filters.search) count++;
        return count;
    }, [filters]);

    return {
        filters,
        setFilters,
        setSearch,
        setStatus,
        setPriority,
        setLevel,
        setAssigneeId,
        setCategoryId,
        setPage,
        setLimit,
        resetFilters,
        activeFilterCount,
    };
}
