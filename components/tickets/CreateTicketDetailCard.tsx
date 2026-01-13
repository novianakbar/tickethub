"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, X, FileText, Image as ImageIcon, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/ticket-config";
import type { CreateTicketFormData, CreateTicketFormErrors } from "@/types/create-ticket";
import type { PendingAttachment } from "@/types/ticket";

interface CreateTicketDetailCardProps {
    formData: CreateTicketFormData;
    errors: CreateTicketFormErrors;
    updateField: (field: string, value: string) => void;
    uploadedFiles: PendingAttachment[];
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleRemoveFile: (fileKey: string) => Promise<void>;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent) => Promise<void>;
}

export function CreateTicketDetailCard({
    formData,
    errors,
    updateField,
    uploadedFiles,
    isUploading,
    fileInputRef,
    handleFileUpload,
    handleRemoveFile,
    handleDragOver,
    handleDrop,
}: CreateTicketDetailCardProps) {
    return (
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
    );
}
