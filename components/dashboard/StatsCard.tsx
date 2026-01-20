"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: number | string;
    description?: string;
    icon: LucideIcon;
    iconClassName?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    onClick?: () => void;
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    iconClassName,
    trend,
    onClick,
    className,
}: StatsCardProps) {
    return (
        <Card
            className={cn(
                "transition-all duration-200",
                onClick && "cursor-pointer hover:shadow-md hover:border-primary/30",
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold">{value}</p>
                            {trend && (
                                <span
                                    className={cn(
                                        "text-xs font-medium",
                                        trend.isPositive
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                    )}
                                >
                                    {trend.isPositive ? "+" : ""}
                                    {trend.value}%
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    <div
                        className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-xl",
                            iconClassName || "bg-primary/10 text-primary"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
