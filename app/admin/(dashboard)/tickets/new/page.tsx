"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCreateTicket } from "@/hooks";
import {
    CreateTicketCustomerCard,
    CreateTicketDetailCard,
    CreateTicketClassificationCard,
    CreateTicketSubmitBar,
    TemplateCombobox,
} from "@/components/tickets";

export default function CreateTicketPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const ticketForm = useCreateTicket();

    useEffect(() => {
        if (status === "loading") return;

        const userRole = session?.user?.role;
        const userLevel = session?.user?.level;
        const canCreate = userRole === "admin" || userLevel?.canCreateTicket;

        if (!canCreate) {
            router.push("/admin/tickets");
        }
    }, [session, status, router]);

    if (status === "loading" || (!session?.user?.role && status === "authenticated")) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }
    return (
        <div className="flex-1 p-6">
            <PageHeader
                title="Buat Tiket Baru"
                description="Input tiket baru untuk pelanggan"
            />

            <form onSubmit={ticketForm.handleSubmit}>
                <div className="pb-24">
                    {/* Back Link */}
                    <Link
                        href="/admin/tickets"
                        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke daftar tiket
                    </Link>

                    {/* Quick Templates */}
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Template:</span>
                        <TemplateCombobox
                            templates={ticketForm.templates}
                            categories={ticketForm.categories}
                            onSelect={ticketForm.applyTemplate}
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Form */}
                        <div className="lg:col-span-2 space-y-4">
                            <CreateTicketCustomerCard
                                formData={ticketForm.formData}
                                errors={ticketForm.errors}
                                updateField={ticketForm.updateField}
                                customerSuggestions={ticketForm.customerSuggestions}
                                showSuggestions={ticketForm.showSuggestions}
                                setShowSuggestions={ticketForm.setShowSuggestions}
                                isSearchingCustomer={ticketForm.isSearchingCustomer}
                                emailInputRef={ticketForm.emailInputRef}
                                selectCustomerSuggestion={ticketForm.selectCustomerSuggestion}
                            />

                            <CreateTicketDetailCard
                                formData={ticketForm.formData}
                                errors={ticketForm.errors}
                                updateField={ticketForm.updateField}
                                uploadedFiles={ticketForm.uploadedFiles}
                                isUploading={ticketForm.isUploading}
                                fileInputRef={ticketForm.fileInputRef}
                                handleFileUpload={ticketForm.handleFileUpload}
                                handleRemoveFile={ticketForm.handleRemoveFile}
                                handleDragOver={ticketForm.handleDragOver}
                                handleDrop={ticketForm.handleDrop}
                            />
                        </div>

                        {/* Right Column - Settings */}
                        <CreateTicketClassificationCard
                            formData={ticketForm.formData}
                            errors={ticketForm.errors}
                            updateField={ticketForm.updateField}
                            categories={ticketForm.categories}
                            levels={ticketForm.levels}
                            slaConfigs={ticketForm.slaConfigs}
                            onDueDateChange={ticketForm.handleDueDateChange}
                        />
                    </div>
                </div>

                <CreateTicketSubmitBar
                    isFormValid={ticketForm.isFormValid}
                    isLoading={ticketForm.isLoading}
                    onCancel={() => router.push("/admin/tickets")}
                    formData={ticketForm.formData}
                    categories={ticketForm.categories}
                    levels={ticketForm.levels}
                />
            </form>
        </div>
    );
}
