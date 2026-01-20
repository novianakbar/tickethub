"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";
import {
    Loader2,
    FileText,
    Image as ImageIcon,
    File,
    Trash2,
    ExternalLink,
    Download,
    Search,
    HardDrive,
    Files,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Attachment {
    id: string;
    fileName: string;
    fileKey: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    createdAt: string;
    ticket: {
        id: string;
        ticketNumber: string;
        subject: string;
    };
    uploadedBy: {
        id: string;
        fullName: string | null;
        email: string;
    };
}

interface Stats {
    totalFiles: number;
    totalSizeBytes: number;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getFileIcon(fileType: string) {
    if (fileType.startsWith("image/")) return ImageIcon;
    if (fileType.includes("pdf")) return FileText;
    return File;
}

function getFileIconColor(fileType: string) {
    if (fileType.startsWith("image/")) return "text-blue-500";
    if (fileType.includes("pdf")) return "text-red-500";
    return "text-gray-500";
}

export default function AttachmentsManagePage() {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [stats, setStats] = useState<Stats>({ totalFiles: 0, totalSizeBytes: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [fileTypeFilter, setFileTypeFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchAttachments = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", page.toString());
            params.set("limit", "20");
            if (fileTypeFilter !== "all") {
                params.set("fileType", fileTypeFilter);
            }

            const res = await fetch(`/api/attachments?${params}`);
            if (res.ok) {
                const data = await res.json();
                setAttachments(data.attachments);
                setStats(data.stats);
                setTotalPages(data.pagination.totalPages);
                setTotal(data.pagination.total);
            } else {
                toast.error("Gagal mengambil data");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    }, [page, fileTypeFilter]);

    useEffect(() => {
        fetchAttachments();
    }, [fetchAttachments]);

    const handleDelete = async (att: Attachment) => {
        if (!confirm(`Hapus file "${att.fileName}"? File akan dihapus permanen.`)) return;

        setIsDeleting(att.id);
        try {
            const res = await fetch(`/api/attachments/${att.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("File berhasil dihapus");
                fetchAttachments();
            } else {
                const data = await res.json();
                toast.error(data.error || "Gagal menghapus file");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsDeleting(null);
        }
    };

    // Filter attachments by search locally
    const filteredAttachments = attachments.filter((att) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            att.fileName.toLowerCase().includes(searchLower) ||
            att.ticket.ticketNumber.toLowerCase().includes(searchLower) ||
            att.ticket.subject.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="flex-1 p-6">
            <PageHeader
                title="Kelola Lampiran"
                description="Kelola semua file lampiran di sistem"
            />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total File
                            </CardTitle>
                            <Files className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalFiles.toLocaleString("id-ID")}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                file tersimpan
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Ukuran
                            </CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatFileSize(stats.totalSizeBytes)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                storage terpakai
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Rata-rata per File
                            </CardTitle>
                            <File className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalFiles > 0
                                    ? formatFileSize(stats.totalSizeBytes / stats.totalFiles)
                                    : "0 B"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ukuran rata-rata
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama file, nomor tiket..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={fileTypeFilter}
                                onValueChange={(value) => {
                                    setFileTypeFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Tipe file" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="image">Gambar</SelectItem>
                                    <SelectItem value="document">Dokumen</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchAttachments}
                                disabled={isLoading}
                            >
                                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredAttachments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Files className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">
                                    {search ? "Tidak ada file yang cocok" : "Belum ada file lampiran"}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">File</TableHead>
                                        <TableHead>Tiket</TableHead>
                                        <TableHead>Ukuran</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAttachments.map((att) => {
                                        const Icon = getFileIcon(att.fileType);
                                        const iconColor = getFileIconColor(att.fileType);

                                        return (
                                            <TableRow key={att.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {att.fileType.startsWith("image/") ? (
                                                            <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={att.fileUrl}
                                                                    alt={att.fileName}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <Icon className={cn("h-8 w-8 shrink-0", iconColor)} />
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="font-medium truncate max-w-[200px]">
                                                                {att.fileName}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {att.uploadedBy.fullName || att.uploadedBy.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={`/admin/tickets/${att.ticket.id}`}
                                                        className="hover:underline"
                                                    >
                                                        <Badge variant="secondary" className="font-mono">
                                                            {att.ticket.ticketNumber}
                                                        </Badge>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {formatFileSize(att.fileSize)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(att.createdAt)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <a
                                                                href={att.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <a href={att.fileUrl} download>
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(att)}
                                                            disabled={isDeleting === att.id}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            {isDeleting === att.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Menampilkan {filteredAttachments.length} dari {total} file
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === totalPages}
                                        onClick={() => setPage(page + 1)}
                                    >
                                        Berikutnya
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
