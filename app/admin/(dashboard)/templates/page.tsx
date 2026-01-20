"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TableCard } from "@/components/ui/table-card";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    FileText,
    ToggleLeft,
    ToggleRight,
    Tag,
    Hash,
    AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/ticket-config";

interface Category {
    id: string;
    name: string;
    color: string;
}

interface Template {
    id: string;
    name: string;
    subject: string;
    content: string;
    priority: string;
    isActive: boolean;
    sortOrder: number;
    categoryId?: string | null;
    category?: {
        id: string;
        name: string;
        color: string;
    } | null;
    updatedAt: string;
}

interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const priorityOptions = [
    { value: "low", label: "Rendah" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "Tinggi" },
    { value: "urgent", label: "Mendesak" },
];

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);

    // Form states
    const [formName, setFormName] = useState("");
    const [formSubject, setFormSubject] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formCategoryId, setFormCategoryId] = useState<string>("");
    const [formPriority, setFormPriority] = useState("normal");
    const [formIsActive, setFormIsActive] = useState(true);
    const [formSortOrder, setFormSortOrder] = useState(0);

    // Pagination state
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    // Fetch templates
    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", pagination.page.toString());
            params.set("limit", pagination.limit.toString());

            const res = await fetch(`/api/templates?${params.toString()}`);
            if (res.ok) {
                const json = await res.json();
                setTemplates(json.templates || []);
                if (json.pagination) {
                    setPagination((prev) => ({
                        ...prev,
                        total: json.pagination.total,
                        totalPages: json.pagination.totalPages,
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch templates:", error);
            toast.error("Gagal memuat template");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit]);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const json = await res.json();
                setCategories(json.categories || []);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
        fetchCategories();
    }, [fetchTemplates, fetchCategories]);

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const handlePageSizeChange = (limit: number) => {
        setPagination((prev) => ({ ...prev, limit, page: 1 }));
    };

    // Reset form
    const resetForm = () => {
        setFormName("");
        setFormSubject("");
        setFormContent("");
        setFormCategoryId("");
        setFormPriority("normal");
        setFormIsActive(true);
        setFormSortOrder(0);
    };

    // Open dialog for create
    const handleOpenCreate = () => {
        setEditingTemplate(null);
        resetForm();
        setIsDialogOpen(true);
    };

    // Open dialog for edit
    const handleOpenEdit = (template: Template) => {
        setEditingTemplate(template);
        setFormName(template.name);
        setFormSubject(template.subject);
        setFormContent(template.content);
        setFormCategoryId(template.categoryId || "");
        setFormPriority(template.priority);
        setFormIsActive(template.isActive);
        setFormSortOrder(template.sortOrder);
        setIsDialogOpen(true);
    };

    // Handle form submit
    const handleSubmit = async () => {
        if (!formName.trim()) {
            toast.error("Nama template harus diisi");
            return;
        }
        if (!formSubject.trim()) {
            toast.error("Subjek harus diisi");
            return;
        }
        if (!formContent.trim()) {
            toast.error("Isi template harus diisi");
            return;
        }

        setIsSubmitting(true);

        const payload = {
            name: formName.trim(),
            subject: formSubject.trim(),
            content: formContent.trim(),
            categoryId: formCategoryId || null,
            priority: formPriority,
            isActive: formIsActive,
            sortOrder: formSortOrder,
        };

        try {
            if (editingTemplate) {
                const res = await fetch(`/api/templates/${editingTemplate.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    toast.success("Template berhasil diperbarui");
                    setIsDialogOpen(false);
                    fetchTemplates();
                } else {
                    const error = await res.json();
                    toast.error(error.error || "Gagal memperbarui template");
                }
            } else {
                const res = await fetch("/api/templates", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    toast.success("Template berhasil ditambahkan");
                    setIsDialogOpen(false);
                    fetchTemplates();
                } else {
                    const error = await res.json();
                    toast.error(error.error || "Gagal menambahkan template");
                }
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle toggle active
    const handleToggleActive = async (template: Template) => {
        try {
            const res = await fetch(`/api/templates/${template.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !template.isActive }),
            });

            if (res.ok) {
                toast.success(
                    template.isActive
                        ? "Template dinonaktifkan"
                        : "Template diaktifkan"
                );
                fetchTemplates();
            }
        } catch (error) {
            console.error("Toggle error:", error);
            toast.error("Gagal mengubah status");
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deletingTemplate) return;

        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/templates/${deletingTemplate.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Template berhasil dihapus");
                setIsDeleteDialogOpen(false);
                setDeletingTemplate(null);
                fetchTemplates();
            } else {
                const error = await res.json();
                toast.error(error.error || "Gagal menghapus template");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 p-6">
            <PageHeader
                title="Template Tiket"
                description="Kelola template cepat untuk pembuatan tiket"
            />

            <TableCard
                title="Daftar Template"
                description="Template membantu membuat tiket dengan cepat berdasarkan jenis permasalahan umum"
                icon={FileText}
                isLoading={isLoading}
                isEmpty={templates.length === 0}
                emptyState={{
                    icon: FileText,
                    title: "Belum ada template",
                    description: "Template membantu membuat tiket dengan cepat. Buat template pertama Anda.",
                    action: (
                        <Button onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4 mr-1" />
                            Buat Template Pertama
                        </Button>
                    ),
                }}
                action={
                    <Button onClick={handleOpenCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Template
                    </Button>
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
                            <TableHead>Nama Template</TableHead>
                            <TableHead>Subjek Default</TableHead>
                            <TableHead className="text-center">Kategori</TableHead>
                            <TableHead className="text-center">Prioritas</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead>Terakhir Update</TableHead>
                            <TableHead className="w-28 text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.map((template, index) => (
                            <TableRow
                                key={template.id}
                                className={cn(
                                    "group transition-colors",
                                    !template.isActive && "bg-muted/30 opacity-60"
                                )}
                            >
                                <TableCell className="text-muted-foreground font-mono text-sm">
                                    {(pagination.page - 1) * pagination.limit + index + 1}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-foreground">{template.name}</div>
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                    {template.subject}
                                </TableCell>
                                <TableCell className="text-center">
                                    {template.category ? (
                                        <Badge
                                            variant="outline"
                                            style={{
                                                backgroundColor: template.category.color + "20",
                                                color: template.category.color,
                                                borderColor: template.category.color + "40",
                                            }}
                                        >
                                            {template.category.name}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={template.priority === "high" || template.priority === "urgent" ? "destructive" : "secondary"}>
                                        {priorityOptions.find(p => p.value === template.priority)?.label || template.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge
                                        variant={template.isActive ? "default" : "secondary"}
                                        className={cn(
                                            "text-xs",
                                            template.isActive
                                                ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                                : ""
                                        )}
                                    >
                                        {template.isActive ? "Aktif" : "Nonaktif"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-muted-foreground text-sm">
                                        {formatDate(template.updatedAt)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleToggleActive(template)}
                                            title={template.isActive ? "Nonaktifkan" : "Aktifkan"}
                                            className="h-8 w-8"
                                        >
                                            {template.isActive ? (
                                                <ToggleRight className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenEdit(template)}
                                            className="h-8 w-8"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setDeletingTemplate(template);
                                                setIsDeleteDialogOpen(true);
                                            }}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
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

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                {editingTemplate ? (
                                    <Pencil className="h-5 w-5" />
                                ) : (
                                    <Plus className="h-5 w-5" />
                                )}
                            </div>
                            <div>
                                <DialogTitle>
                                    {editingTemplate ? "Edit Template" : "Tambah Template"}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingTemplate
                                        ? "Perbarui detail template"
                                        : "Buat template baru untuk mempercepat pembuatan tiket"}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="space-y-5 py-2">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                Nama Template
                            </Label>
                            <Input
                                id="name"
                                placeholder="Contoh: Reset Password"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Label yang akan muncul di tombol Template Cepat.
                            </p>
                        </div>

                        {/* Category & Priority */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Kategori Otomatis</Label>
                                <Select
                                    value={formCategoryId}
                                    onValueChange={setFormCategoryId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Kategori default saat menggunakan template ini.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Prioritas</Label>
                                <Select
                                    value={formPriority}
                                    onValueChange={setFormPriority}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih prioritas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorityOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subjek Default</Label>
                            <Input
                                id="subject"
                                placeholder="Subjek tiket..."
                                value={formSubject}
                                onChange={(e) => setFormSubject(e.target.value)}
                            />
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <Label htmlFor="content">Isi Template</Label>
                            <Textarea
                                id="content"
                                placeholder="Deskripsi detail tiket..."
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                rows={5}
                                className="resize-none"
                            />
                        </div>

                        {/* Sort Order & Active */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sortOrder" className="flex items-center gap-2">
                                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                    Urutan
                                </Label>
                                <Input
                                    id="sortOrder"
                                    type="number"
                                    value={formSortOrder}
                                    onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Semakin kecil semakin di depan.
                                </p>
                            </div>

                            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Status Aktif</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Template aktif muncul di pembuatan tiket.
                                    </p>
                                </div>
                                <Switch
                                    checked={formIsActive}
                                    onCheckedChange={setFormIsActive}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {editingTemplate ? "Simpan Perubahan" : "Tambah Template"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-center">Hapus Template</DialogTitle>
                        <DialogDescription className="text-center">
                            Anda yakin ingin menghapus template{" "}
                            <strong className="text-foreground">{deletingTemplate?.name}</strong>?
                            <br />
                            <span className="text-xs">Tindakan ini tidak dapat dibatalkan.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-2 sm:justify-center">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setDeletingTemplate(null);
                            }}
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none"
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
