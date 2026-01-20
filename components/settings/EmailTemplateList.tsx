"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    FileCode,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { EmailTemplate } from "@/types/email-template";
import { Skeleton } from "@/components/ui/skeleton";

export function EmailTemplateList() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch("/api/email-templates");
            if (!response.ok) throw new Error("Failed to fetch templates");
            const data = await response.json();
            setTemplates(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load email templates");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;

        try {
            const response = await fetch(`/api/email-templates/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete template");

            toast.success("Template deleted successfully");
            fetchTemplates();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete template");
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Email Templates</CardTitle>
                    <CardDescription>
                        Manage email templates for system notifications.
                    </CardDescription>
                </div>
                <Link href="/admin/email-templates/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Template
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <FileCode className="mb-4 h-12 w-12 opacity-20" />
                        <p className="mb-2 text-lg font-medium">No templates found</p>
                        <p className="text-sm">
                            Create your first email template to get started.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Alias</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead className="w-[70px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {templates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">
                                            {template.name}
                                            {template.description && (
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {template.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {template.alias}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="truncate max-w-[300px]">
                                            {template.subject}
                                        </TableCell>
                                        <TableCell>
                                            {template.isActive ? (
                                                <div className="flex items-center text-green-600 text-sm">
                                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                                    Active
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-muted-foreground text-sm">
                                                    <XCircle className="mr-1 h-4 w-4" />
                                                    Inactive
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(template.updatedAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <Link href={`/admin/email-templates/${template.id}`}>
                                                        <DropdownMenuItem>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(template.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
