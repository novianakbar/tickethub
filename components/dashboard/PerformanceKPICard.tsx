"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Timer, Zap } from "lucide-react";

interface PerformanceKPIProps {
    avgResponseTime: number | null; // hours
    avgResolutionTime: number | null; // hours
}

export function PerformanceKPICard({ avgResponseTime, avgResolutionTime }: PerformanceKPIProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-full">
                        <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Rata-rata Waktu Respon</p>
                        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-100">
                            {avgResponseTime ? `${avgResponseTime} Jam` : "-"}
                        </h3>
                        <p className="text-xs text-blue-600/80 dark:text-blue-400/80">Respon pertama ke customer</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-full">
                        <Timer className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-300">Rata-rata Penyelesaian</p>
                        <h3 className="text-2xl font-bold text-green-700 dark:text-green-100">
                            {avgResolutionTime ? `${avgResolutionTime} Jam` : "-"}
                        </h3>
                        <p className="text-xs text-green-600/80 dark:text-green-400/80">Waktu tiket closed/resolved</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
