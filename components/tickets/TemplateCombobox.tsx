"use client";

import * as React from "react";
import { Check, ChevronsUpDown, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { QuickTemplate, CategoryOption } from "@/types/create-ticket";
import { createTicketPriorityOptions } from "@/lib/ticket-config";

interface TemplateComboboxProps {
    templates: QuickTemplate[];
    categories?: CategoryOption[];
    onSelect: (template: QuickTemplate) => void;
}

export function TemplateCombobox({
    templates,
    categories = [],
    onSelect,
}: TemplateComboboxProps) {
    const [open, setOpen] = React.useState(false);

    // Get category name from id
    const getCategoryName = (categoryId?: string | null) => {
        if (!categoryId) return null;
        return categories.find(c => c.id === categoryId)?.name;
    };

    // Get priority label
    const getPriorityLabel = (priority?: string) => {
        if (!priority) return null;
        return createTicketPriorityOptions.find(p => p.value === priority)?.label;
    };

    // Get priority color class
    const getPriorityClass = (priority?: string) => {
        switch (priority) {
            case "low": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
            case "normal": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
            case "high": return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
            case "urgent": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
            default: return "";
        }
    };

    if (templates.length === 0) {
        return null;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full sm:w-[280px] justify-between text-muted-foreground"
                    size="sm"
                >
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Pilih template...</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Cari template..." />
                    <CommandList>
                        <CommandEmpty>Template tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                            {templates.map((template) => {
                                const categoryName = getCategoryName(template.categoryId);
                                const priorityLabel = getPriorityLabel(template.priority);
                                const priorityClass = getPriorityClass(template.priority);

                                return (
                                    <CommandItem
                                        key={template.id}
                                        value={`${template.name} ${template.subject} ${categoryName || ""}`}
                                        onSelect={() => {
                                            onSelect(template);
                                            setOpen(false);
                                        }}
                                        className="flex flex-col items-start gap-1 py-2"
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="font-medium truncate flex-1">{template.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 ml-6">
                                            {categoryName && (
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                    {categoryName}
                                                </Badge>
                                            )}
                                            {priorityLabel && (
                                                <Badge className={cn("text-[10px] px-1.5 py-0", priorityClass)}>
                                                    {priorityLabel}
                                                </Badge>
                                            )}
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
