"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Mail, Phone, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateTicketFormData, CreateTicketFormErrors, CustomerSuggestion } from "@/types/create-ticket";

interface CreateTicketCustomerCardProps {
    formData: CreateTicketFormData;
    errors: CreateTicketFormErrors;
    updateField: (field: string, value: string) => void;
    customerSuggestions: CustomerSuggestion[];
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    isSearchingCustomer: boolean;
    emailInputRef: React.RefObject<HTMLInputElement | null>;
    selectCustomerSuggestion: (customer: CustomerSuggestion) => void;
}

export function CreateTicketCustomerCard({
    formData,
    errors,
    updateField,
    customerSuggestions,
    showSuggestions,
    setShowSuggestions,
    isSearchingCustomer,
    emailInputRef,
    selectCustomerSuggestion,
}: CreateTicketCustomerCardProps) {
    return (
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
    );
}
