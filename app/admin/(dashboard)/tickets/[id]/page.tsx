"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
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
    SLAIndicator,
    AssignTicketDialog,
} from "@/components/tickets";
import { AttachmentViewer, useAttachmentViewer } from "@/components/AttachmentViewer";

// Import hooks
import { useTicketDetail } from "@/hooks/useTicketDetail";
import { useSession } from "next-auth/react"; // Add useSession

import { statusConfig, priorityConfig } from "@/lib/ticket-config";

// Configs
const levelConfig = {
    L1: { label: "L1 - Support", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", border: "border-l-blue-500" },
    L2: { label: "L2 - Specialist", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", border: "border-l-orange-500" },
    L3: { label: "L3 - Expert", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", border: "border-l-purple-500" },
};

export default function AdminTicketDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: session } = useSession();
    const attachmentViewer = useAttachmentViewer();

    const {
        ticket,
        isLoading,
        isSubmitting,
        handleStatusChange,
        handlePriorityChange,
        handleEscalate,
        handleAssigneeChange,
        handleSendReply,
        handleAddNote,
        handleUploadAttachments,
        handleDeleteAttachment,
    } = useTicketDetail({ ticketId: id });

    // Fetch agents list for assignment
    const [agents, setAgents] = useState<Array<{
        id: string;
        fullName: string | null;
        email: string;
        role?: string;
        level?: { id: string; code: string; name: string } | null;
    }>>([]);

    useEffect(() => {
        fetch("/api/users/agents")
            .then((res) => res.json())
            .then((data) => {
                if (data.agents) {
                    setAgents(data.agents);
                }
            })
            .catch(console.error);
    }, []);

    // Dialog state for assign ticket
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    // Read-only logic:
    // User is NOT admin AND ticket is assigned to someone else
    const isReadOnly =
        session?.user?.role !== "admin" &&
        !!ticket?.assigneeId &&
        ticket.assigneeId !== session?.user?.id;

    if (isLoading) {
        return (
            <div className="flex-1 p-6">
                <PageHeader title="Loading..." />
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="flex-1 p-6">
                <PageHeader title="Tiket tidak ditemukan" />
                <div className="flex flex-col items-center justify-center py-16">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Tiket tidak ditemukan</p>
                    <Button asChild className="mt-4">
                        <Link href="/admin/tickets">Kembali</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/tickets"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">Tiket {ticket.ticketNumber}</h1>
                        <p className="text-sm text-muted-foreground truncate max-w-xl">{ticket.subject}</p>
                    </div>
                </div>
                {/* Quick Actions integrated into header */}
                <QuickActionsBar
                    ticketNumber={ticket.ticketNumber}
                    status={ticket.status}
                    level={ticket.level}
                    onStatusChange={handleStatusChange}
                    onEscalate={handleEscalate}
                    onAssign={() => setAssignDialogOpen(true)}
                    readOnly={isReadOnly}
                />
            </div>

            {/* SLA Indicator Bar - Prominent position */}
            <div className="mb-4">
                <SLAIndicator
                    createdAt={ticket.createdAt}
                    dueDate={ticket.dueDate}
                    status={ticket.status}
                    resolvedAt={ticket.resolvedAt}
                    variant="inline"
                />
            </div>

            <div className="grid gap-3 lg:grid-cols-4">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-3">
                    {/* Ticket Header Card */}
                    <TicketHeaderCard
                        ticket={ticket}
                        statusConfig={statusConfig}
                        priorityConfig={priorityConfig}
                        onViewAttachment={attachmentViewer.openViewer}
                        onDeleteAttachment={handleDeleteAttachment}
                        onUploadAttachments={handleUploadAttachments}
                        // @ts-ignore - Prop will be added shortly
                        readOnly={isReadOnly}
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
                                        // @ts-ignore - Prop will be added shortly
                                        readOnly={isReadOnly}
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
                                        // @ts-ignore - Prop will be added shortly
                                        readOnly={isReadOnly}
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
                <div className="lg:sticky lg:top-4 lg:self-start">
                    <TicketDetailSidebar
                        ticket={ticket}
                        agents={agents}
                        onAssigneeChange={(assigneeId) => handleAssigneeChange(assigneeId)}
                        readOnly={isReadOnly}
                    />
                </div>
            </div>

            {/* Assign Ticket Dialog */}
            <AssignTicketDialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
                agents={agents}
                currentAssigneeId={ticket.assigneeId}
                onAssign={handleAssigneeChange}
            />

            {/* Attachment Viewer Modal */}
            <AttachmentViewer
                file={attachmentViewer.file}
                open={attachmentViewer.open}
                onOpenChange={attachmentViewer.setOpen}
            />
        </div>
    );
}
