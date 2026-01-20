"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
    isAdmin?: boolean;
}

export function DashboardSkeleton({ isAdmin = false }: DashboardSkeletonProps) {
    return (
        <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Stats Grid Skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-8 w-12" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-11 w-11 rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions Skeleton */}
            <div className="flex gap-3">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-36" />
            </div>

            {/* Admin Charts Section */}
            {isAdmin && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardContent className="p-6">
                            <Skeleton className="h-6 w-40 mb-4" />
                            <Skeleton className="h-[200px] w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <Skeleton className="h-6 w-40 mb-4" />
                            <Skeleton className="h-[200px] w-full" />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Urgent Tickets Skeleton */}
                <Card>
                    <CardContent className="p-6">
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-64 mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border rounded-lg p-3">
                                    <div className="flex gap-2 mb-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Feed Skeleton */}
                <Card>
                    <CardContent className="p-6">
                        <Skeleton className="h-6 w-40 mb-2" />
                        <Skeleton className="h-4 w-48 mb-4" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Tickets Skeleton */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="border rounded-lg p-4">
                                <div className="flex gap-2 mb-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="h-5 w-3/4 mb-2" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
