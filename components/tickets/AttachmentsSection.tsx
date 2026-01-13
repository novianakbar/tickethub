"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Paperclip,
    Download,
    FileText,
    Image as ImageIcon,
    File,
    FileArchive,
    ExternalLink,
    Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Attachment {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    createdAt: string;
}

interface AttachmentsSectionProps {
    attachments: Attachment[];
    className?: string;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(fileType: string) {
    if (fileType.startsWith("image/")) return ImageIcon;
    if (fileType.includes("pdf")) return FileText;
    if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("7z")) return FileArchive;
    return File;
}

function getFileIconColor(fileType: string) {
    if (fileType.startsWith("image/")) return "text-blue-500";
    if (fileType.includes("pdf")) return "text-red-500";
    if (fileType.includes("zip") || fileType.includes("rar")) return "text-yellow-500";
    if (fileType.includes("doc") || fileType.includes("word")) return "text-blue-600";
    if (fileType.includes("xls") || fileType.includes("sheet")) return "text-green-600";
    return "text-gray-500";
}

export function AttachmentsSection({ attachments, className }: AttachmentsSectionProps) {
    if (attachments.length === 0) return null;

    // Separate images from other files
    const images = attachments.filter((a) => a.fileType.startsWith("image/"));
    const files = attachments.filter((a) => !a.fileType.startsWith("image/"));

    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Lampiran ({attachments.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Image Thumbnails */}
                {images.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Gambar</p>
                        <div className="grid grid-cols-3 gap-2">
                            {images.map((img) => (
                                <a
                                    key={img.id}
                                    href={img.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative aspect-square rounded-lg overflow-hidden bg-muted border hover:border-primary transition-colors"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img.fileUrl}
                                        alt={img.fileName}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Eye className="h-5 w-5 text-white" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* File List */}
                {files.length > 0 && (
                    <div className="space-y-2">
                        {images.length > 0 && (
                            <p className="text-xs font-medium text-muted-foreground">File</p>
                        )}
                        <div className="space-y-1.5">
                            {files.map((file) => {
                                const Icon = getFileIcon(file.fileType);
                                const iconColor = getFileIconColor(file.fileType);

                                return (
                                    <div
                                        key={file.id}
                                        className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group"
                                    >
                                        <Icon className={cn("h-5 w-5 shrink-0", iconColor)} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.fileName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(file.fileSize)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                asChild
                                            >
                                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                asChild
                                            >
                                                <a href={file.fileUrl} download>
                                                    <Download className="h-3.5 w-3.5" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
