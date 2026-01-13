"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCreateTicket } from "@/hooks";
import { quickTemplates } from "@/lib/ticket-config";
import {
    CreateTicketCustomerCard,
    CreateTicketDetailCard,
    CreateTicketClassificationCard,
    CreateTicketSubmitBar,
} from "@/components/tickets";

export default function CreateTicketPage() {
    const router = useRouter();
    const ticketForm = useCreateTicket();

    return (
        <>
            <AdminHeader
                title="Buat Tiket Baru"
                description="Input tiket baru untuk pelanggan"
            />

            <div className="flex-1 overflow-auto">
                <form onSubmit={ticketForm.handleSubmit}>
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
                                        onClick={() => ticketForm.applyTemplate(template)}
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
                            />
                        </div>
                    </div>

                    {/* Sticky Submit Bar */}
                    <CreateTicketSubmitBar
                        isFormValid={ticketForm.isFormValid}
                        isLoading={ticketForm.isLoading}
                        onCancel={() => router.push("/admin/tickets")}
                    />
                </form>
            </div>
        </>
    );
}
