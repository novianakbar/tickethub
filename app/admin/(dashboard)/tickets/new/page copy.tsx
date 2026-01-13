"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    Loader2,
    Upload,
    X,
    FileText,
    Image as ImageIcon,
    User,
    Mail,
    Phone,
    Building,
    Tag,
    ArrowLeft,
    Send,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    color: string;
}

interface UploadedFile {
    fileName: string;
    fileKey: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
}

interface CustomerSuggestion {
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    ticketCount: number;
}

const priorityOptions = [
    { value: "low", label: "Rendah", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
    { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    { value: "high", label: "Tinggi", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
    { value: "urgent", label: "Mendesak", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
];

const levelOptions = [
    { value: "L1", label: "L1 - Support" },
    { value: "L2", label: "L2 - Specialist" },
    { value: "L3", label: "L3 - Expert" },
];

const sourceOptions = [
    { value: "phone", label: "📞 Telepon" },
    { value: "email", label: "📧 Email" },
    { value: "walk_in", label: "🚶 Walk-in" },
    { value: "web", label: "🌐 Web" },
];

// Quick templates for common ticket types
const quickTemplates = [
    { label: "Reset Password", subject: "Permintaan Reset Password", description: "Pelanggan meminta reset password untuk akun mereka.\n\nDetail:\n- Email terdaftar: \n- Alasan: " },
    { label: "Komplain Layanan", subject: "Komplain Layanan", description: "Pelanggan mengajukan komplain terkait layanan.\n\nKronologi:\n\nHarapan pelanggan:" },
    { label: "Pertanyaan Umum", subject: "Pertanyaan Informasi", description: "Pelanggan bertanya mengenai:\n\n" },
];

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function CreateTicketPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerCompany: "",
        subject: "",
        description: "",
        categoryId: "",
        priority: "normal",
        level: "L1",
        source: "phone",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/categories?active=true");
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Search existing customers by email
    const searchCustomer = useCallback(async (email: string) => {
        if (email.length < 3) {
            setCustomerSuggestions([]);
            return;
        }

        setIsSearchingCustomer(true);
        try {
            const res = await fetch(`/api/auth/lookup?email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.customers && data.customers.length > 0) {
                    setCustomerSuggestions(data.customers);
                    setShowSuggestions(true);
                } else {
                    setCustomerSuggestions([]);
                }
            }
        } catch (error) {
            console.error("Customer search error:", error);
        } finally {
            setIsSearchingCustomer(false);
        }
    }, []);

    // Debounced email search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.customerEmail) {
                searchCustomer(formData.customerEmail);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [formData.customerEmail, searchCustomer]);

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const selectCustomerSuggestion = (customer: CustomerSuggestion) => {
        setFormData((prev) => ({
            ...prev,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone || "",
            customerCompany: customer.company || "",
        }));
        setShowSuggestions(false);
        toast.success("Data pelanggan diisi otomatis");
    };

    const applyTemplate = (template: typeof quickTemplates[0]) => {
        setFormData((prev) => ({
            ...prev,
            subject: template.subject,
            description: template.description,
        }));
        toast.success(`Template "${template.label}" diterapkan`);
    };

    // Validate form
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = "Nama wajib diisi";
        }
        if (!formData.customerEmail.trim()) {
            newErrors.customerEmail = "Email wajib diisi";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
            newErrors.customerEmail = "Format email tidak valid";
        }
        if (!formData.subject.trim()) {
            newErrors.subject = "Subjek wajib diisi";
        }
        if (!formData.description.trim()) {
            newErrors.description = "Deskripsi wajib diisi";
        }
        if (!formData.categoryId) {
            newErrors.categoryId = "Kategori wajib dipilih";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);

        for (const file of Array.from(files)) {
            try {
                const uploadFormData = new FormData();
                uploadFormData.append("file", file);
                uploadFormData.append("folder", "tickets");

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (res.ok) {
                    const data = await res.json();
                    // Map upload API response to UploadedFile format
                    setUploadedFiles((prev) => [...prev, {
                        fileName: data.file.name,
                        fileKey: data.file.key,
                        fileUrl: data.file.url,
                        fileSize: data.file.size,
                        fileType: data.file.type,
                    }]);
                } else {
                    const error = await res.json();
                    toast.error(error.error || `Gagal upload ${file.name}`);
                }
            } catch (error) {
                console.error("Upload error:", error);
                toast.error(`Gagal upload ${file.name}`);
            }
        }

        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Remove uploaded file
    const handleRemoveFile = async (fileKey: string) => {
        try {
            await fetch("/api/upload", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: fileKey }),
            });
            setUploadedFiles((prev) => prev.filter((f) => f.fileKey !== fileKey));
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const input = fileInputRef.current;
            if (input) {
                const dataTransfer = new DataTransfer();
                Array.from(files).forEach((file) => dataTransfer.items.add(file));
                input.files = dataTransfer.files;
                handleFileUpload({ target: input } as React.ChangeEvent<HTMLInputElement>);
            }
        }
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Mohon lengkapi data yang diperlukan");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    attachments: uploadedFiles,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Tiket ${data.ticket.ticketNumber} berhasil dibuat`);
                router.push(`/admin/tickets/${data.ticket.id}`);
            } else {
                const error = await res.json();
                toast.error(error.error || "Gagal membuat tiket");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = formData.customerName && formData.customerEmail && formData.subject && formData.categoryId && formData.description;

    return (
        <>
            <AdminHeader
                title="Buat Tiket Baru"
                description="Input tiket baru untuk pelanggan"
            />

            <div className="flex-1 overflow-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 pb-24">
                        {/* Back Link */}
                        <Link
                            href="/admin/tickets"
                            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke daftar tiket
                        </Link>

                        {/* Quick Templates */}
                        <div className="mb-4">
                            <p className="text-xs text-muted-foreground mb-2">Template Cepat:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickTemplates.map((template) => (
                                    <Button
                                        key={template.label}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => applyTemplate(template)}
                                        className="text-xs"
                                    >
                                        {template.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column - Main Form */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Customer Info */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Informasi Pelanggan
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {/* Email with autocomplete */}
                                            <div className="space-y-1.5 relative">
                                                <Label htmlFor="customerEmail" className="text-xs flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    Email <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        ref={emailInputRef}
                                                        id="customerEmail"
                                                        type="email"
                                                        placeholder="email@contoh.com"
                                                        value={formData.customerEmail}
                                                        onChange={(e) => updateField("customerEmail", e.target.value)}
                                                        onFocus={() => customerSuggestions.length > 0 && setShowSuggestions(true)}
                                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                        className={cn("h-9 pr-8", errors.customerEmail && "border-red-500")}
                                                    />
                                                    {isSearchingCustomer && (
                                                        <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                                                    )}
                                                </div>
                                                {errors.customerEmail && (
                                                    <p className="text-xs text-red-500">{errors.customerEmail}</p>
                                                )}

                                                {/* Customer Suggestions Dropdown */}
                                                {showSuggestions && customerSuggestions.length > 0 && (
                                                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg">
                                                        <div className="p-1">
                                                            <p className="px-2 py-1 text-xs text-muted-foreground">Pelanggan ditemukan:</p>
                                                            {customerSuggestions.map((customer, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    type="button"
                                                                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted flex items-center justify-between"
                                                                    onClick={() => selectCustomerSuggestion(customer)}
                                                                >
                                                                    <div>
                                                                        <p className="font-medium">{customer.name}</p>
                                                                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                                                                    </div>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {customer.ticketCount} tiket
                                                                    </Badge>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Name */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="customerName" className="text-xs flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    Nama <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="customerName"
                                                    placeholder="Nama lengkap"
                                                    value={formData.customerName}
                                                    onChange={(e) => updateField("customerName", e.target.value)}
                                                    className={cn("h-9", errors.customerName && "border-red-500")}
                                                />
                                                {errors.customerName && (
                                                    <p className="text-xs text-red-500">{errors.customerName}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {/* Phone */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="customerPhone" className="text-xs flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    Telepon
                                                </Label>
                                                <Input
                                                    id="customerPhone"
                                                    placeholder="08xxxxxxxxxx"
                                                    value={formData.customerPhone}
                                                    onChange={(e) => updateField("customerPhone", e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>

                                            {/* Company */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="customerCompany" className="text-xs flex items-center gap-1">
                                                    <Building className="h-3 w-3" />
                                                    Perusahaan
                                                </Label>
                                                <Input
                                                    id="customerCompany"
                                                    placeholder="Opsional"
                                                    value={formData.customerCompany}
                                                    onChange={(e) => updateField("customerCompany", e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Ticket Details */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Tag className="h-4 w-4" />
                                            Detail Tiket
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Subject */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="subject" className="text-xs">
                                                Subjek <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="subject"
                                                placeholder="Ringkasan masalah atau permintaan"
                                                value={formData.subject}
                                                onChange={(e) => updateField("subject", e.target.value)}
                                                className={cn("h-9", errors.subject && "border-red-500")}
                                            />
                                            {errors.subject && (
                                                <p className="text-xs text-red-500">{errors.subject}</p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="description" className="text-xs">
                                                Deskripsi <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Jelaskan detail masalah atau permintaan pelanggan..."
                                                rows={6}
                                                value={formData.description}
                                                onChange={(e) => updateField("description", e.target.value)}
                                                className={cn(errors.description && "border-red-500")}
                                            />
                                            {errors.description && (
                                                <p className="text-xs text-red-500">{errors.description}</p>
                                            )}
                                        </div>

                                        {/* Attachments */}
                                        <div className="space-y-2">
                                            <Label className="text-xs">Lampiran</Label>
                                            <div
                                                className={cn(
                                                    "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                                                    "hover:border-primary/50 hover:bg-muted/50",
                                                    isUploading && "pointer-events-none opacity-50"
                                                )}
                                                onClick={() => fileInputRef.current?.click()}
                                                onDragOver={handleDragOver}
                                                onDrop={handleDrop}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                                                    multiple
                                                    onChange={handleFileUpload}
                                                />
                                                {isUploading ? (
                                                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                                                ) : (
                                                    <>
                                                        <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                                                        <p className="text-xs text-muted-foreground">
                                                            Klik atau drag file (PDF, JPG, PNG)
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            {/* Uploaded Files */}
                                            {uploadedFiles.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {uploadedFiles.map((file) => (
                                                        <div
                                                            key={file.fileKey}
                                                            className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
                                                        >
                                                            {file.fileType.startsWith("image/") ? (
                                                                <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                                                            ) : (
                                                                <FileText className="h-3.5 w-3.5 text-red-500" />
                                                            )}
                                                            <span className="max-w-[120px] truncate">{file.fileName}</span>
                                                            <span className="text-muted-foreground">
                                                                {formatFileSize(file.fileSize)}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFile(file.fileKey)}
                                                                className="text-muted-foreground hover:text-red-500"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Settings */}
                            <div className="space-y-4">
                                {/* Category & Classification */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Klasifikasi</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Category */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">
                                                Kategori <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={formData.categoryId}
                                                onValueChange={(value) => updateField("categoryId", value)}
                                            >
                                                <SelectTrigger className={cn("h-9", errors.categoryId && "border-red-500")}>
                                                    <SelectValue placeholder="Pilih kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="h-2.5 w-2.5 rounded-full"
                                                                    style={{ backgroundColor: cat.color }}
                                                                />
                                                                {cat.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.categoryId && (
                                                <p className="text-xs text-red-500">{errors.categoryId}</p>
                                            )}
                                        </div>

                                        {/* Source */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Sumber</Label>
                                            <Select
                                                value={formData.source}
                                                onValueChange={(value) => updateField("source", value)}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sourceOptions.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Separator />

                                        {/* Level */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Level</Label>
                                            <Select
                                                value={formData.level}
                                                onValueChange={(value) => updateField("level", value)}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {levelOptions.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Priority */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Prioritas</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {priorityOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => updateField("priority", opt.value)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                                            formData.priority === opt.value
                                                                ? cn(opt.color, "ring-2 ring-offset-1 ring-primary")
                                                                : "bg-muted hover:bg-muted/80"
                                                        )}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Info Box */}
                                <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                                    <CardContent className="p-4">
                                        <div className="flex gap-3">
                                            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                            <div className="text-xs text-blue-800 dark:text-blue-300">
                                                <p className="font-medium mb-1">Tips</p>
                                                <ul className="list-disc list-inside space-y-0.5 text-blue-700 dark:text-blue-400">
                                                    <li>Masukkan email untuk auto-fill data pelanggan existing</li>
                                                    <li>Gunakan template untuk tiket umum</li>
                                                    <li>Upload bukti/screenshot jika ada</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Submit Bar */}
                    <div className="fixed bottom-0 left-0 right-0 lg:left-64 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 z-10">
                        <div className="flex items-center justify-between max-w-5xl">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {isFormValid ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>Form lengkap, siap submit</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                        <span>Lengkapi data yang diperlukan</span>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/admin/tickets")}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isLoading || !isFormValid}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Buat Tiket
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
