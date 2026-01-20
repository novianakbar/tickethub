"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { TableCard } from "@/components/ui/table-card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { toast } from "sonner";
import { Plus, FileCode, Pencil, Trash2 } from "lucide-react";

interface EmailTemplate {
    id: string;
    name: string;
    alias: string;
    subject: string;
    description?: string;
    isActive: boolean;
    updatedAt: string;
}

interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination state
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", pagination.page.toString());
            params.set("limit", pagination.limit.toString());

            const response = await fetch(`/api/email-templates?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                // Handle both array response and paginated response
                if (Array.isArray(data)) {
                    setTemplates(data);
                    setPagination((prev) => ({
                        ...prev,
                        total: data.length,
                        totalPages: 1,
                    }));
                } else {
                    setTemplates(data.templates || data);
                    if (data.pagination) {
                        setPagination((prev) => ({
                            ...prev,
                            total: data.pagination.total,
                            totalPages: data.pagination.totalPages,
                        }));
                    }
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat template email");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const handlePageSizeChange = (limit: number) => {
        setPagination((prev) => ({ ...prev, limit, page: 1 }));
    };

    // Delete handler
    const handleDelete = async (template: EmailTemplate) => {
        if (!confirm(`Hapus template "${template.name}"?`)) return;

        try {
            const response = await fetch(`/api/email-templates/${template.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Template berhasil dihapus");
                fetchTemplates();
            } else {
                toast.error("Gagal menghapus template");
            }
        } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus template");
        }
    };

    return (
        <div className="flex-1 p-6">
            <PageHeader
                title="Email Templates"
                description="Kelola template email untuk notifikasi sistem"
                action={
                    <Link href="/admin/email-templates/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Template
                        </Button>
                    </Link>
                }
            />

            <TableCard
                title="Daftar Template Email"
                description="Template digunakan untuk mengirim notifikasi email otomatis"
                icon={FileCode}
                isLoading={isLoading}
                isEmpty={templates.length === 0}
                emptyState={{
                    icon: FileCode,
                    title: "Belum ada template",
                    description: "Buat template email pertama untuk notifikasi sistem.",
                    action: (
                        <Link href="/admin/email-templates/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-1" />
                                Buat Template Pertama
                            </Button>
                        </Link>
                    ),
                }}
                action={
                    <Link href="/admin/email-templates/new">
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" /> Tambah
                        </Button>
                    </Link>
                }
                footer={
                    pagination.totalPages > 0 && (
                        <DataTablePagination
                            pageIndex={pagination.page}
                            pageSize={pagination.limit}
                            rowCount={pagination.total}
                            pageCount={pagination.totalPages}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    )
                }
            >
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Alias</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead>Terakhir Update</TableHead>
                            <TableHead className="w-24">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.map((template, index) => (
                            <TableRow key={template.id}>
                                <TableCell className="text-muted-foreground font-mono text-sm">
                                    {(pagination.page - 1) * pagination.limit + index + 1}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{template.name}</p>
                                        {template.description && (
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {template.description}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {template.alias}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-[250px] truncate">
                                    {template.subject}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={template.isActive ? "default" : "secondary"}>
                                        {template.isActive ? "Aktif" : "Nonaktif"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {format(new Date(template.updatedAt), "dd MMM yyyy")}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Link href={`/admin/email-templates/${template.id}`}>
                                            <Button size="icon-sm" variant="ghost">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            size="icon-sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(template)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableCard>
        </div>
    );
}
