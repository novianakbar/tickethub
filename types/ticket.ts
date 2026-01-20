// Ticket Types
// Centralized type definitions for ticket-related entities

// Status, Priority unions
export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

// Support Level (from master table)
export interface SupportLevel {
    id: string;
    code: string;
    name: string;
    sortOrder?: number;
}

// Support Level with permissions (full version)
export interface SupportLevelWithPermissions extends SupportLevel {
    description?: string;
    canViewOwnTickets: boolean;
    canViewTeamTickets: boolean;
    canViewAllTickets: boolean;
    canCreateTicket: boolean;
    canAssignTicket: boolean;
    canEscalateTicket: boolean;
    canResolveTicket: boolean;
    canCloseTicket: boolean;
}

// Author/User reference
export interface Author {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl?: string | null;
}

// Attachment
export interface Attachment {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    createdAt?: string;
}

// Pending attachment (before save)
export interface PendingAttachment {
    fileName: string;
    fileKey: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
}

// Ticket Reply
export interface TicketReply {
    id: string;
    message: string;
    createdAt: string;
    author: Author | null;
    isCustomer?: boolean;
    attachments?: Attachment[];
}

// Internal Note
export interface TicketNote {
    id: string;
    content: string;
    createdAt: string;
    author: Author;
    attachments?: Attachment[];
}

// Activity Log
export interface TicketActivity {
    id: string;
    type: string;
    description: string;
    createdAt: string;
    author: Author;
}

// Category
export interface TicketCategory {
    id: string;
    name: string;
    color: string;
}

// Full Ticket Detail
export interface TicketDetail {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    level: SupportLevel;
    source: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    customerCompany: string | null;
    dueDate?: string | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    closedAt: string | null;
    category: TicketCategory;
    assignee: Author | null;
    assigneeId: string | null;
    createdBy: Author;
    createdById: string;
    replies: TicketReply[];
    notes: TicketNote[];
    activities: TicketActivity[];
    attachments: Attachment[];
}

// Config types
export interface StatusConfigItem {
    label: string;
    className: string;
}

export interface PriorityConfigItem {
    label: string;
    className: string;
}

