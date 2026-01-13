"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
    CreateTicketFormData,
    CreateTicketFormErrors,
    CustomerSuggestion,
    CategoryOption,
    LevelOption,
    QuickTemplate,
    UseCreateTicketReturn,
} from "@/types/create-ticket";
import type { PendingAttachment } from "@/types/ticket";

const defaultFormData: CreateTicketFormData = {
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCompany: "",
    subject: "",
    description: "",
    categoryId: "",
    priority: "normal",
    levelId: "", // Will be set after fetching levels
    source: "phone",
};

export function useCreateTicket(): UseCreateTicketReturn {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState<CreateTicketFormData>(defaultFormData);
    const [errors, setErrors] = useState<CreateTicketFormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    // Categories & Levels
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [levels, setLevels] = useState<LevelOption[]>([]);

    // File upload
    const [uploadedFiles, setUploadedFiles] = useState<PendingAttachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Customer search
    const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

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

    // Fetch levels
    const fetchLevels = useCallback(async () => {
        try {
            const res = await fetch("/api/support-levels");
            if (res.ok) {
                const data = await res.json();
                setLevels(data.levels);
                // Set default levelId to first level (L1) if available
                if (data.levels.length > 0 && !formData.levelId) {
                    setFormData(prev => ({ ...prev, levelId: data.levels[0].id }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch levels:", error);
        }
    }, [formData.levelId]);

    useEffect(() => {
        fetchCategories();
        fetchLevels();
    }, [fetchCategories, fetchLevels]);

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

    // Update field
    const updateField = useCallback((field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user types
        setErrors((prev) => {
            if (prev[field]) {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            }
            return prev;
        });
    }, []);

    // Select customer suggestion
    const selectCustomerSuggestion = useCallback((customer: CustomerSuggestion) => {
        setFormData((prev) => ({
            ...prev,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone || "",
            customerCompany: customer.company || "",
        }));
        setShowSuggestions(false);
        toast.success("Data pelanggan diisi otomatis");
    }, []);

    // Apply template
    const applyTemplate = useCallback((template: QuickTemplate) => {
        setFormData((prev) => ({
            ...prev,
            subject: template.subject,
            description: template.description,
        }));
        toast.success(`Template "${template.label}" diterapkan`);
    }, []);

    // Validate form
    const validateForm = useCallback(() => {
        const newErrors: CreateTicketFormErrors = {};

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
        if (!formData.levelId) {
            newErrors.levelId = "Level wajib dipilih";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Handle file upload
    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    }, []);

    // Remove uploaded file
    const handleRemoveFile = useCallback(async (fileKey: string) => {
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
    }, []);

    // Handle drag over
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // Handle drop
    const handleDrop = useCallback(async (e: React.DragEvent) => {
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
    }, [handleFileUpload]);

    // Submit form
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
    }, [formData, uploadedFiles, validateForm, router]);

    // Check form validity
    const isFormValid = Boolean(
        formData.customerName &&
        formData.customerEmail &&
        formData.subject &&
        formData.categoryId &&
        formData.description
    );

    return {
        // Form state
        formData,
        errors,
        isLoading,
        isFormValid,

        // Categories & Levels
        categories,
        levels,

        // File upload
        uploadedFiles,
        isUploading,
        fileInputRef,
        handleFileUpload,
        handleRemoveFile,
        handleDragOver,
        handleDrop,

        // Customer search
        customerSuggestions,
        showSuggestions,
        setShowSuggestions,
        isSearchingCustomer,
        emailInputRef,
        selectCustomerSuggestion,

        // Form actions
        updateField,
        applyTemplate,
        handleSubmit,
    };
}
