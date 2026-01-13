// Public Ticket Types
// Types for public-facing ticket data (subset of full TicketDetail)

export type PublicTicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";

export interface PublicTicketCategory {
    name: string;
    color: string;
}

export interface PublicTicketReply {
    message: string;
    createdAt: string;
    isCustomer: boolean;
    attachments?: PublicTicketAttachment[];
}

export interface PublicTicketAttachment {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    createdAt?: string;
}

// Public ticket data returned from lookup API
export interface PublicTicket {
    id: string;
    ticketNumber: string;
    subject: string;
    status: PublicTicketStatus;
    customerName: string;
    customerEmail: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    closedAt: string | null;
    category: PublicTicketCategory;
    replies: PublicTicketReply[];
    attachments: PublicTicketAttachment[];
    activities: PublicTicketActivity[];
}

// Public activity for timeline
export interface PublicTicketActivity {
    type: string;
    description: string;
    createdAt: string;
}

// Session data stored in sessionStorage
export interface VerifiedTicketSession {
    ticketNumber: string;
    email: string;
    ticket: PublicTicket;
    verifiedAt: number; // timestamp
}
