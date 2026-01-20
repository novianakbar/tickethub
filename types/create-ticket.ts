// Create Ticket Form Types
// Type definitions for create ticket page

import { PendingAttachment } from "./ticket";

// Form data structure
export interface CreateTicketFormData {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerCompany: string;
    subject: string;
    description: string;
    categoryId: string;
    priority: string;
    levelId: string; // Changed from level to levelId
    source: string;
    sourceNotes: string;
    dueDate: string; // ISO date string or empty for auto-calculate
}

// Form validation errors
export type CreateTicketFormErrors = Record<string, string>;

// Customer suggestion from lookup API
export interface CustomerSuggestion {
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    ticketCount: number;
}

// Category from API
export interface CategoryOption {
    id: string;
    name: string;
    color: string;
}

// Quick template for common ticket types
export interface QuickTemplate {
    id: string;
    name: string; // was label
    subject: string;
    content: string; // was description
    priority: string;
    categoryId?: string | null;
}

// Priority option with styling
export interface PriorityOption {
    value: string;
    label: string;
    color: string;
}

// Level option - from SupportLevel master table
export interface LevelOption {
    id: string;
    code: string;
    name: string;
    sortOrder?: number;
}

// Source option
export interface SourceOption {
    value: string;
    label: string;
}

// SLA Config type
export interface SLAConfig {
    id: string;
    priority: string;
    durationHrs: number;
}

// Hook return type
export interface UseCreateTicketReturn {
    // Form state
    formData: CreateTicketFormData;
    errors: CreateTicketFormErrors;
    isLoading: boolean;
    isFormValid: boolean;

    // Categories & Levels
    categories: CategoryOption[];
    levels: LevelOption[];
    templates: QuickTemplate[];
    slaConfigs: SLAConfig[];

    // File upload
    uploadedFiles: PendingAttachment[];
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleRemoveFile: (fileKey: string) => Promise<void>;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent) => Promise<void>;

    // Customer search
    customerSuggestions: CustomerSuggestion[];
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    isSearchingCustomer: boolean;
    emailInputRef: React.RefObject<HTMLInputElement | null>;
    selectCustomerSuggestion: (customer: CustomerSuggestion) => void;

    // Form actions
    updateField: (field: string, value: string) => void;
    handleDueDateChange: (value: string) => void;
    applyTemplate: (template: QuickTemplate) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
}

