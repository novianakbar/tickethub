"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import type { TicketsByDayData } from "@/types/dashboard";

interface TicketTrendChartProps {
    data: TicketsByDayData[];
    className?: string;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
    });
}

export function TicketTrendChart({ data, className }: TicketTrendChartProps) {
    // Calculate trend
    const totalCreated = data.reduce((sum, d) => sum + d.created, 0);
    const totalResolved = data.reduce((sum, d) => sum + d.resolved, 0);
    const resolutionRate = totalCreated > 0
        ? Math.round((totalResolved / totalCreated) * 100)
        : 0;

    // Format data for chart
    const chartData = data.map((item) => ({
        ...item,
        date: formatDate(item.date),
    }));

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Tren Tiket (7 Hari)</CardTitle>
                        <CardDescription>
                            Tiket masuk vs diselesaikan
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                            {resolutionRate >= 80 ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="font-medium">{resolutionRate}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tingkat penyelesaian
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 10,
                                left: 0,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                className="text-muted-foreground"
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--popover))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                                labelStyle={{ fontWeight: 600 }}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: "12px" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="created"
                                name="Masuk"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="resolved"
                                name="Selesai"
                                stroke="#22c55e"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
