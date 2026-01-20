// Ticket Configuration
// Centralized config for status, priority, and categories
// Level is now managed via /api/support-levels

export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

// SupportLevel type from API
export interface SupportLevel {
    id: string;
    code: string;
    name: string;
    description?: string;
    sortOrder: number;
}

export interface StatusConfig {
    label: string;
    className: string;
    description: string;
}

export interface PriorityConfig {
    label: string;
    className: string;
}

export const statusConfig: Record<TicketStatus, StatusConfig> = {
    open: {
        label: "Baru",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        description: "Tiket baru atau menunggu tindakan agen",
    },
    in_progress: {
        label: "Diproses",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        description: "Tiket sedang dikerjakan oleh agen",
    },
    pending: {
        label: "Menunggu Info",
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        description: "Menunggu respons atau informasi dari pelanggan",
    },
    resolved: {
        label: "Selesai",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        description: "Masalah telah diselesaikan",
    },
    closed: {
        label: "Ditutup",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
        description: "Tiket telah ditutup secara permanen",
    },
};

export const priorityConfig: Record<TicketPriority, PriorityConfig> = {
    low: {
        label: "Rendah",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    },
    normal: {
        label: "Normal",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    high: {
        label: "Tinggi",
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    },
    urgent: {
        label: "Mendesak",
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
};

// Get level badge className based on level code
export function getLevelClassName(levelCode: string): string {
    switch (levelCode) {
        case "L1":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        case "L2":
            return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
        case "L3":
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
}

// Categories and Levels are now managed dynamically via database
// Use /api/categories and /api/support-levels to fetch

export const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
    value: value as TicketStatus,
    label: config.label,
}));

export const priorityOptions = Object.entries(priorityConfig).map(([value, config]) => ({
    value: value as TicketPriority,
    label: config.label,
}));

// Source options for ticket origin
export const sourceOptions = [
    { value: "phone", label: "📞 Telepon" },
    { value: "email", label: "📧 Email" },
    { value: "walk_in", label: "🚶 Walk-in" },
    { value: "web", label: "🌐 Web" },
];

// Priority options with color styling (for create ticket form)
export const createTicketPriorityOptions = [
    { value: "low", label: "Rendah", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
    { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    { value: "high", label: "Tinggi", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
    { value: "urgent", label: "Mendesak", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
];

// Quick templates for common ticket types
export const quickTemplates = [
    { label: "Reset Password", subject: "Permintaan Reset Password", description: "Pelanggan meminta reset password untuk akun mereka.\n\nDetail:\n- Email terdaftar: \n- Alasan: " },
    { label: "Komplain Layanan", subject: "Komplain Layanan", description: "Pelanggan mengajukan komplain terkait layanan.\n\nKronologi:\n\nHarapan pelanggan:" },
    { label: "Pertanyaan Umum", subject: "Pertanyaan Informasi", description: "Pelanggan bertanya mengenai:\n\n" },
];

// File size formatter
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// Date formatting
export function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatShortDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Ticket Interface
export interface Ticket {
    id: string;
    subject: string;
    description?: string;
    status: TicketStatus;
    priority: TicketPriority;
    level: SupportLevel;
    category: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    assignee?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TimelineEvent {
    id: number;
    type: "created" | "status_change" | "level_change" | "update" | "assign";
    message: string;
    author?: string;
    timestamp: string;
}

export interface InternalNote {
    id: number;
    message: string;
    author: string;
    timestamp: string;
}

