"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    FolderOpen,
    Tag,
    ToggleLeft,
    ToggleRight,
    Eye,
    EyeOff,
    Palette,
    Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string;
    icon: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

// Preset colors for quick selection
const presetColors = [
    { name: "Merah", value: "#EF4444" },
    { name: "Oranye", value: "#F97316" },
    { name: "Kuning", value: "#EAB308" },
    { name: "Hijau", value: "#22C55E" },
    { name: "Tosca", value: "#14B8A6" },
    { name: "Biru", value: "#3B82F6" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Ungu", value: "#A855F7" },
    { name: "Pink", value: "#EC4899" },
    { name: "Abu", value: "#6B7280" },
];

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

    // Form states
    const [formName, setFormName] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formColor, setFormColor] = useState("#3B82F6");

    // Stats
    const activeCount = categories.filter((c) => c.isActive).length;
    const inactiveCount = categories.filter((c) => !c.isActive).length;

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const { categories } = await res.json();
                setCategories(categories);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast.error("Gagal memuat kategori");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Open dialog for create
    const handleOpenCreate = () => {
        setEditingCategory(null);
        setFormName("");
        setFormDescription("");
        setFormColor("#3B82F6");
        setIsDialogOpen(true);
    };

    // Open dialog for edit
    const handleOpenEdit = (category: Category) => {
        setEditingCategory(category);
        setFormName(category.name);
        setFormDescription(category.description || "");
        setFormColor(category.color);
        setIsDialogOpen(true);
    };

    // Handle form submit
    const handleSubmit = async () => {
        if (!formName.trim()) {
            toast.error("Nama kategori harus diisi");
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingCategory) {
                const res = await fetch(`/api/categories/${editingCategory.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: formName.trim(),
                        description: formDescription.trim() || null,
                        color: formColor,
                    }),
                });

                if (res.ok) {
                    toast.success("Kategori berhasil diperbarui");
                    setIsDialogOpen(false);
                    fetchCategories();
                } else {
                    const error = await res.json();
                    toast.error(error.error || "Gagal memperbarui kategori");
                }
            } else {
                const res = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: formName.trim(),
                        description: formDescription.trim() || null,
                        color: formColor,
                    }),
                });

                if (res.ok) {
                    toast.success("Kategori berhasil ditambahkan");
                    setIsDialogOpen(false);
                    fetchCategories();
                } else {
                    const error = await res.json();
                    toast.error(error.error || "Gagal menambahkan kategori");
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
    const handleToggleActive = async (category: Category) => {
        try {
            const res = await fetch(`/api/categories/${category.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !category.isActive }),
            });

            if (res.ok) {
                toast.success(
                    category.isActive
                        ? "Kategori dinonaktifkan"
                        : "Kategori diaktifkan"
                );
                fetchCategories();
            }
        } catch (error) {
            console.error("Toggle error:", error);
            toast.error("Gagal mengubah status");
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deletingCategory) return;

        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/categories/${deletingCategory.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Kategori berhasil dihapus");
                setIsDeleteDialogOpen(false);
                setDeletingCategory(null);
                fetchCategories();
            } else {
                const error = await res.json();
                toast.error(error.error || "Gagal menghapus kategori");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <AdminHeader
                title="Kategori"
                description="Kelola kategori untuk mengelompokkan tiket"
            />

            <div className="flex-1 overflow-auto p-6">
                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <Card className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Kategori</p>
                                    <p className="text-2xl font-bold">{categories.length}</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Tag className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Aktif</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                    <Eye className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-gray-400">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nonaktif</p>
                                    <p className="text-2xl font-bold text-muted-foreground">{inactiveCount}</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <EyeOff className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Daftar Kategori</CardTitle>
                                <CardDescription>
                                    Kategori digunakan untuk mengelompokkan tiket berdasarkan jenis permasalahan
                                </CardDescription>
                            </div>
                        </div>
                        <Button onClick={handleOpenCreate} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tambah Kategori
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Memuat kategori...</p>
                                </div>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="mb-1 font-semibold">Belum ada kategori</h3>
                                <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                                    Kategori membantu mengelompokkan tiket berdasarkan jenis permasalahan untuk penanganan yang lebih efisien.
                                </p>
                                <Button onClick={handleOpenCreate}>
                                    <Plus className="h-4 w-4" />
                                    Buat Kategori Pertama
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead className="w-24 text-center">Warna</TableHead>
                                        <TableHead className="w-24 text-center">Status</TableHead>
                                        <TableHead className="w-32 text-center">Dibuat</TableHead>
                                        <TableHead className="w-28 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((category, index) => (
                                        <TableRow
                                            key={category.id}
                                            className={cn(
                                                "group transition-colors",
                                                !category.isActive && "bg-muted/30 opacity-60"
                                            )}
                                        >
                                            <TableCell className="text-muted-foreground font-mono text-sm">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                                                        style={{ backgroundColor: category.color + "20" }}
                                                    >
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: category.color }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{category.name}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            {category.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                {category.description ? (
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {category.description}
                                                    </p>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/50 italic">
                                                        Tidak ada deskripsi
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <div
                                                        className="h-4 w-4 rounded border"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <span className="font-mono text-xs text-muted-foreground">
                                                        {category.color}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={category.isActive ? "default" : "secondary"}
                                                    className={cn(
                                                        "text-xs",
                                                        category.isActive
                                                            ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                                            : ""
                                                    )}
                                                >
                                                    {category.isActive ? "Aktif" : "Nonaktif"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {formatDate(category.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => handleToggleActive(category)}
                                                        title={category.isActive ? "Nonaktifkan" : "Aktifkan"}
                                                        className="h-8 w-8"
                                                    >
                                                        {category.isActive ? (
                                                            <ToggleRight className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => handleOpenEdit(category)}
                                                        className="h-8 w-8"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => {
                                                            setDeletingCategory(category);
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
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                {editingCategory ? (
                                    <Pencil className="h-5 w-5" />
                                ) : (
                                    <Plus className="h-5 w-5" />
                                )}
                            </div>
                            <div>
                                <DialogTitle>
                                    {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingCategory
                                        ? "Perbarui detail kategori"
                                        : "Buat kategori baru untuk mengelompokkan tiket"}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="space-y-5 py-2">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                Nama Kategori
                            </Label>
                            <Input
                                id="name"
                                placeholder="Contoh: Pembayaran, Akun, Teknis"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="h-10"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="flex items-center gap-2">
                                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                Deskripsi
                                <span className="text-xs text-muted-foreground font-normal">(Opsional)</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Deskripsi singkat tentang kategori ini..."
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                rows={2}
                                className="resize-none"
                            />
                        </div>

                        {/* Color */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                                Warna Kategori
                            </Label>

                            {/* Preset Colors */}
                            <div className="flex flex-wrap gap-2">
                                {presetColors.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setFormColor(color.value)}
                                        className={cn(
                                            "h-8 w-8 rounded-lg border-2 transition-all hover:scale-110",
                                            formColor === color.value
                                                ? "border-foreground ring-2 ring-ring ring-offset-2"
                                                : "border-transparent"
                                        )}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>

                            {/* Custom Color */}
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <input
                                        type="color"
                                        value={formColor}
                                        onChange={(e) => setFormColor(e.target.value)}
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    />
                                    <div
                                        className="h-10 w-10 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                                        style={{ backgroundColor: formColor }}
                                    >
                                        <Palette className="h-4 w-4 text-white mix-blend-difference" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <Input
                                        value={formColor}
                                        onChange={(e) => setFormColor(e.target.value)}
                                        className="font-mono text-sm h-10"
                                        placeholder="#3B82F6"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="rounded-lg border bg-muted/30 p-3">
                                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: formColor + "20" }}
                                    >
                                        <div
                                            className="h-4 w-4 rounded-full"
                                            style={{ backgroundColor: formColor }}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium">{formName || "Nama Kategori"}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formDescription || "Deskripsi kategori"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {editingCategory ? "Simpan Perubahan" : "Tambah Kategori"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-center">Hapus Kategori</DialogTitle>
                        <DialogDescription className="text-center">
                            Anda yakin ingin menghapus kategori{" "}
                            <strong className="text-foreground">{deletingCategory?.name}</strong>?
                            <br />
                            <span className="text-xs">Tindakan ini tidak dapat dibatalkan.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-center">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setDeletingCategory(null);
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
        </>
    );
}
