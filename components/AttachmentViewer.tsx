"use client";

import { useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    Download,
    Maximize2,
    X,
} from "lucide-react";

export interface AttachmentFile {
    id?: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
}

interface AttachmentViewerProps {
    file: AttachmentFile | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function isImage(fileType: string): boolean {
    return fileType.startsWith("image/");
}

function isPdf(fileType: string): boolean {
    return fileType === "application/pdf" || fileType.includes("pdf");
}

export function AttachmentViewer({ file, open, onOpenChange }: AttachmentViewerProps) {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);

    // Handle wheel/pinch gesture for zoom - must be before any early returns
    const handleWheel = useCallback((e: React.WheelEvent) => {
        // Pinch gesture on trackpad sends wheel event with ctrlKey
        // Also support regular scroll wheel with Ctrl held
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -10 : 10;
            setZoom((prev) => Math.min(Math.max(prev + delta, 50), 300));
        }
    }, []);

    // Early return AFTER all hooks
    if (!file) return null;

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
    const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
    const handleReset = () => {
        setZoom(100);
        setRotation(0);
    };

    // Download file - use direct link with download attribute via proxy API if attachment has ID
    const handleDownload = () => {
        if (file.id) {
            // Use proxy API to bypass CORS
            window.location.href = `/api/attachments/${file.id}/download`;
        } else {
            // Fallback: open in new tab (for files without ID)
            window.open(file.fileUrl, "_blank");
        }
    };

    // For non-image and non-PDF files, just download
    if (!isImage(file.fileType) && !isPdf(file.fileType)) {
        handleDownload();
        onOpenChange(false);
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[95vw]! w-[95vw]! h-[90vh]! flex flex-col p-0 gap-0"
                showCloseButton={false}
            >
                {/* Header */}
                <DialogHeader className="p-4 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="truncate max-w-[50%]">
                            {file.fileName}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            {/* Zoom controls for images */}
                            {isImage(file.fileType) && (
                                <>
                                    <div className="flex items-center gap-1 border rounded-md">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleZoomOut}
                                            disabled={zoom <= 50}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xs font-medium w-12 text-center">
                                            {zoom}%
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleZoomIn}
                                            disabled={zoom >= 300}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRotate}
                                        className="h-8 w-8 p-0"
                                        title="Putar"
                                    >
                                        <RotateCw className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleReset}
                                        className="h-8 w-8 p-0"
                                        title="Reset"
                                    >
                                        <Maximize2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                className="h-8 w-8 p-0"
                                title="Download"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center">
                    {isImage(file.fileType) ? (
                        <div
                            className="w-full h-full flex items-center justify-center p-4 overflow-auto"
                            onWheel={handleWheel}
                        >
                            <div
                                className="transition-transform duration-200 flex items-center justify-center"
                                style={{
                                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={file.fileUrl}
                                    alt={file.fileName}
                                    className="max-w-full max-h-[calc(90vh-80px)] object-contain select-none"
                                    draggable={false}
                                />
                            </div>
                        </div>
                    ) : isPdf(file.fileType) ? (
                        <iframe
                            src={file.fileUrl}
                            className="w-full h-full border-0"
                            title={file.fileName}
                        />
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Hook to manage attachment viewer state
 */
export function useAttachmentViewer() {
    const [viewerState, setViewerState] = useState<{
        open: boolean;
        file: AttachmentFile | null;
    }>({
        open: false,
        file: null,
    });

    const openViewer = (file: AttachmentFile) => {
        // For non-viewable files, just download directly
        if (!isImage(file.fileType) && !isPdf(file.fileType)) {
            const link = document.createElement("a");
            link.href = file.fileUrl;
            link.download = file.fileName;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        setViewerState({
            open: true,
            file,
        });
    };

    const closeViewer = () => {
        setViewerState({
            open: false,
            file: null,
        });
    };

    return {
        ...viewerState,
        openViewer,
        closeViewer,
        setOpen: (open: boolean) => {
            if (!open) closeViewer();
        },
    };
}

/**
 * Utility to determine file type action
 */
export function getFileAction(fileType: string): "view-image" | "view-pdf" | "download" {
    if (isImage(fileType)) return "view-image";
    if (isPdf(fileType)) return "view-pdf";
    return "download";
}
