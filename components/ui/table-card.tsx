"use client";

import * as React from "react";
import { LucideIcon, Loader2 } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TableCardProps {
    /** Card title */
    title: string;
    /** Optional card description */
    description?: string;
    /** Optional icon displayed next to title */
    icon?: LucideIcon;
    /** Action element (usually a Button) displayed on the right side of header */
    action?: React.ReactNode;
    /** Table content as children */
    children: React.ReactNode;
    /** Loading state */
    isLoading?: boolean;
    /** Empty state configuration */
    emptyState?: {
        icon: LucideIcon;
        title: string;
        description: string;
        action?: React.ReactNode;
    };
    /** Show empty state when true */
    isEmpty?: boolean;
    /** Optional className for Card */
    className?: string;
    /** Optional className for CardContent */
    contentClassName?: string;
    /** Footer content (e.g., pagination) */
    footer?: React.ReactNode;
}

/**
 * TableCard - A reusable wrapper component for tables with consistent styling
 * 
 * Features:
 * - Card wrapper with header (icon, title, description, action)
 * - Loading state
 * - Empty state with customizable icon, title, description, and action
 * - Footer slot for pagination
 */
export function TableCard({
    title,
    description,
    icon: Icon,
    action,
    children,
    isLoading = false,
    emptyState,
    isEmpty = false,
    className,
    contentClassName,
    footer,
}: TableCardProps) {
    const EmptyIcon = emptyState?.icon;

    return (
        <Card className={cn(className)}>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                        </div>
                    )}
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        {description && (
                            <CardDescription>{description}</CardDescription>
                        )}
                    </div>
                </div>
                {action}
            </CardHeader>

            <CardContent className={cn("p-0", contentClassName)}>
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Memuat data...</p>
                        </div>
                    </div>
                ) : isEmpty && emptyState ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        {EmptyIcon && (
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <EmptyIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                        <h3 className="mb-1 font-semibold">{emptyState.title}</h3>
                        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                            {emptyState.description}
                        </p>
                        {emptyState.action}
                    </div>
                ) : (
                    children
                )}
            </CardContent>

            {footer && !isLoading && !isEmpty && (
                <div className="border-t p-4">
                    {footer}
                </div>
            )}
        </Card>
    );
}
