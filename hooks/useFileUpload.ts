"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import type { PendingAttachment } from "@/types/ticket";

interface UseFileUploadOptions {
    folder: string;
    onSuccess?: (file: PendingAttachment) => void;
}

interface UseFileUploadReturn {
    files: PendingAttachment[];
    isUploading: boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
    triggerUpload: () => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    removeFile: (index: number) => void;
    clearFiles: () => void;
    setFiles: React.Dispatch<React.SetStateAction<PendingAttachment[]>>;
}

export function useFileUpload({ folder, onSuccess }: UseFileUploadOptions): UseFileUploadReturn {
    const [files, setFiles] = useState<PendingAttachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const triggerUpload = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        setIsUploading(true);

        for (const file of Array.from(selectedFiles)) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", folder);

            try {
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    const newFile: PendingAttachment = {
                        fileName: data.file.name,
                        fileKey: data.file.key,
                        fileUrl: data.file.url,
                        fileSize: data.file.size,
                        fileType: data.file.type,
                    };
                    setFiles((prev) => [...prev, newFile]);
                    onSuccess?.(newFile);
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
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }, [folder, onSuccess]);

    const removeFile = useCallback((index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const clearFiles = useCallback(() => {
        setFiles([]);
    }, []);

    return {
        files,
        isUploading,
        inputRef,
        triggerUpload,
        handleFileChange,
        removeFile,
        clearFiles,
        setFiles,
    };
}
