"use client";

import { use } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, MessageSquare, FileText, Clock, AlertCircle } from "lucide-react";

// Import components
import {
    TicketDetailSidebar,
    QuickActionsBar,
    TicketTimeline,
    ReplyList,
    NoteList,
    ReplyForm,
    NoteForm,
    TicketHeaderCard,
} from "@/components/tickets";
import { AttachmentViewer, useAttachmentViewer } from "@/components/AttachmentViewer";

// Import hooks
import { useTicketDetail } from "@/hooks/useTicketDetail";

// Configs
const levelConfig = {
    L1: { label: "L1 - Support", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", border: "border-l-blue-500" },
    L2: { label: "L2 - Specialist", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", border: "border-l-orange-500" },
    L3: { label: "L3 - Expert", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", border: "border-l-purple-500" },
};

const statusConfig = {
    open: { label: "Menunggu", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    in_progress: { label: "Diproses", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    pending: { label: "Pending", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    resolved: { label: "Selesai", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    closed: { label: "Ditutup", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
};

const priorityConfig = {
    low: { label: "Rendah", className: "text-gray-500" },
    normal: { label: "Normal", className: "text-blue-500" },
    high: { label: "Tinggi", className: "text-orange-500" },
    urgent: { label: "Mendesak", className: "text-red-500 font-semibold" },
};

export default function AdminTicketDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const attachmentViewer = useAttachmentViewer();

    const {
        ticket,
        isLoading,
        isSubmitting,
        handleStatusChange,
        handlePriorityChange,
        handleEscalate,
        handleSendReply,
        handleAddNote,
        handleUploadAttachments,
        handleDeleteAttachment,
    } = useTicketDetail({ ticketId: id });

    if (isLoading) {
        return (
            <>
                <AdminHeader title="Loading..." />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </>
        );
    }

    if (!ticket) {
        return (
            <>
                <AdminHeader title="Tiket tidak ditemukan" />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Tiket tidak ditemukan</p>
                    <Button asChild className="mt-4">
                        <Link href="/admin/tickets">Kembali</Link>
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <AdminHeader
                title={`Tiket ${ticket.ticketNumber}`}
                description={ticket.subject}
            />

            <div className="flex-1 overflow-auto p-6">
                {/* Back Link */}
                <Link
                    href="/admin/tickets"
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke daftar tiket
                </Link>

                {/* Quick Actions Bar */}
                <div className="mb-6">
                    <QuickActionsBar
                        ticketNumber={ticket.ticketNumber}
                        status={ticket.status}
                        level={ticket.level}
                        onStatusChange={handleStatusChange}
                        onEscalate={handleEscalate}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Ticket Header Card */}
                        <TicketHeaderCard
                            ticket={ticket}
                            statusConfig={statusConfig}
                            priorityConfig={priorityConfig}
                            onViewAttachment={attachmentViewer.openViewer}
                            onDeleteAttachment={handleDeleteAttachment}
                            onUploadAttachments={handleUploadAttachments}
                        />

                        {/* Activity & Notes Tabs */}
                        <Card>
                            <Tabs defaultValue="replies">
                                <CardHeader className="pb-3">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="replies" className="gap-1.5">
                                            <MessageSquare className="h-4 w-4" />
                                            <span className="hidden sm:inline">Balasan</span>
                                            {ticket.replies.length > 0 && (
                                                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium">
                                                    {ticket.replies.length}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="notes" className="gap-1.5">
                                            <FileText className="h-4 w-4" />
                                            <span className="hidden sm:inline">Catatan</span>
                                            {ticket.notes.length > 0 && (
                                                <span className="ml-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                                                    {ticket.notes.length}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="activity" className="gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            <span className="hidden sm:inline">Aktivitas</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </CardHeader>
                                <CardContent>
                                    {/* Replies Tab */}
                                    <TabsContent value="replies" className="mt-0">
                                        <ReplyList
                                            replies={ticket.replies}
                                            onViewAttachment={attachmentViewer.openViewer}
                                        />
                                        <Separator className="my-4" />
                                        <ReplyForm
                                            onSubmit={handleSendReply}
                                            isSubmitting={isSubmitting}
                                        />
                                    </TabsContent>

                                    {/* Notes Tab */}
                                    <TabsContent value="notes" className="mt-0">
                                        <NoteList
                                            notes={ticket.notes}
                                            onViewAttachment={attachmentViewer.openViewer}
                                        />
                                        <Separator className="my-4" />
                                        <NoteForm
                                            onSubmit={handleAddNote}
                                            isSubmitting={isSubmitting}
                                        />
                                    </TabsContent>

                                    {/* Activity Tab */}
                                    <TabsContent value="activity" className="mt-0">
                                        <TicketTimeline activities={ticket.activities} />
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:sticky lg:top-6 lg:self-start">
                        <TicketDetailSidebar
                            ticket={ticket}
                            onStatusChange={handleStatusChange}
                            onPriorityChange={handlePriorityChange}
                            onEscalate={handleEscalate}
                        />
                    </div>
                </div>
            </div>

            {/* Attachment Viewer Modal */}
            <AttachmentViewer
                file={attachmentViewer.file}
                open={attachmentViewer.open}
                onOpenChange={attachmentViewer.setOpen}
            />
        </>
    );
}
