"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardStatsResponse } from "@/types/dashboard";

interface UseDashboardResult {
    data: DashboardStatsResponse | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useDashboard(): UseDashboardResult {
    const [data, setData] = useState<DashboardStatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/dashboard/stats");

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to fetch dashboard data");
            }

            const result: DashboardStatsResponse = await response.json();
            setData(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : "An error occurred";
            setError(message);
            console.error("Dashboard fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchDashboard,
    };
}
