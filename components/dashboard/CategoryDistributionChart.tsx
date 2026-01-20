"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import type { TicketsByCategoryData } from "@/types/dashboard";

interface CategoryDistributionChartProps {
    data: TicketsByCategoryData[];
    className?: string;
}

export function CategoryDistributionChart({ data, className }: CategoryDistributionChartProps) {
    // Filter out categories with 0 tickets and transform to plain objects for recharts
    const filteredData = data.filter((item) => item.count > 0);
    const chartData = filteredData.map((item) => ({
        category: item.category,
        count: item.count,
        color: item.color,
    }));
    const total = filteredData.reduce((sum, item) => sum + item.count, 0);

    if (chartData.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Distribusi Kategori</CardTitle>
                    <CardDescription>Tiket berdasarkan kategori</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[250px]">
                        <p className="text-muted-foreground text-sm">
                            Belum ada data kategori
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Distribusi Kategori</CardTitle>
                <CardDescription>
                    Total {total} tiket berdasarkan kategori
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="count"
                                nameKey="category"
                                label={({ name, percent }) =>
                                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                                }
                                labelLine={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        stroke="hsl(var(--background))"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--popover))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                                formatter={(value, name) => [
                                    `${value} tiket`,
                                    String(name),
                                ]}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: "12px" }}
                                layout="horizontal"
                                verticalAlign="bottom"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
