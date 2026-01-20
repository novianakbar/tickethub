import { Ticket, TicketReply, Category } from "@prisma/client";

// Type untuk profile dengan field minimal yang dibutuhkan untuk email
export type ProfileForEmail = {
  id: string;
  email: string;
  fullName?: string | null;
};

// Type untuk ticket dengan relasi (flexible untuk berbagai query)
export type TicketWithRelations = Ticket & {
  category?: Category | null;
  assignee?: ProfileForEmail | null;
  createdBy?: ProfileForEmail | null;
};

// Type untuk reply dengan relasi
export type ReplyWithAuthor = TicketReply & {
  author?: ProfileForEmail | null;
};

export interface EmailVariables {
  [key: string]: string;
}

/**
 * Get global variables yang dipakai di semua template
 */
export function getGlobalVariables(): EmailVariables {
  return {
    APP_NAME: process.env.APP_NAME || "TicketHub",
    COMPANY_NAME: process.env.COMPANY_NAME || "TicketHub Inc.",
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || "support@example.com",
    CURRENT_YEAR: new Date().getFullYear().toString(),
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };
}

/**
 * Get variables dari ticket
 */
export function getTicketVariables(ticket: TicketWithRelations): EmailVariables {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  // Format status untuk display
  const statusMap: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    pending: "Pending",
    resolved: "Resolved",
    closed: "Closed",
  };

  // Format priority untuk display
  const priorityMap: Record<string, string> = {
    low: "Low",
    normal: "Normal",
    high: "High",
    urgent: "Urgent",
  };

  // Priority colors
  const priorityColorMap: Record<string, string> = {
    low: "#6b7280",
    normal: "#3b82f6",
    high: "#f59e0b",
    urgent: "#dc2626",
  };

  // Status colors
  const statusColorMap: Record<string, string> = {
    open: "#3b82f6",
    in_progress: "#f59e0b",
    pending: "#8b5cf6",
    resolved: "#16a34a",
    closed: "#6b7280",
  };

  return {
    TICKET_NUMBER: ticket.ticketNumber,
    TICKET_SUBJECT: ticket.subject,
    TICKET_DESCRIPTION: ticket.description,
    TICKET_STATUS: statusMap[ticket.status] || ticket.status,
    TICKET_PRIORITY: priorityMap[ticket.priority] || ticket.priority,
    TICKET_CATEGORY: ticket.category?.name || "-",
    TICKET_URL: `${baseUrl}/track?ticket=${ticket.ticketNumber}`,
    TICKET_ADMIN_URL: `${baseUrl}/admin/tickets/${ticket.id}`,
    CREATED_AT: formatDateTime(ticket.createdAt),
    PRIORITY_COLOR: priorityColorMap[ticket.priority] || "#6b7280",
    STATUS_COLOR: statusColorMap[ticket.status] || "#6b7280",
    // SLA
    SLA_DEADLINE: ticket.dueDate ? formatDateTime(ticket.dueDate) : "-",
  };
}

/**
 * Get variables dari customer (embedded in ticket)
 */
export function getCustomerVariables(ticket: Ticket): EmailVariables {
  return {
    CUSTOMER_NAME: ticket.customerName,
    CUSTOMER_EMAIL: ticket.customerEmail,
    CUSTOMER_PHONE: ticket.customerPhone || "-",
    CUSTOMER_COMPANY: ticket.customerCompany || "-",
    CUSTOMER_INITIAL: getInitial(ticket.customerName),
  };
}

/**
 * Get variables dari agent/profile
 */
export function getAgentVariables(agent: ProfileForEmail | null, prefix = "AGENT"): EmailVariables {
  if (!agent) {
    return {
      [`${prefix}_NAME`]: "-",
      [`${prefix}_EMAIL`]: "-",
      [`${prefix}_INITIAL`]: "-",
    };
  }

  return {
    [`${prefix}_NAME`]: agent.fullName || agent.email,
    [`${prefix}_EMAIL`]: agent.email,
    [`${prefix}_INITIAL`]: getInitial(agent.fullName || agent.email),
  };
}

/**
 * Get variables dari reply
 */
export function getReplyVariables(reply: ReplyWithAuthor): EmailVariables {
  const authorName = reply.author?.fullName || reply.author?.email || "Customer";
  
  return {
    REPLY_CONTENT: reply.message,
    REPLY_DATE: formatDateTime(reply.createdAt),
    REPLY_BY: authorName,
  };
}

/**
 * Get variables untuk status change
 */
export function getStatusChangeVariables(
  oldStatus: string,
  newStatus: string,
  updatedBy?: ProfileForEmail | null
): EmailVariables {
  const statusMap: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    pending: "Pending",
    resolved: "Resolved",
    closed: "Closed",
  };

  const statusColorMap: Record<string, string> = {
    open: "#3b82f6",
    in_progress: "#f59e0b",
    pending: "#8b5cf6",
    resolved: "#16a34a",
    closed: "#6b7280",
  };

  return {
    OLD_STATUS: statusMap[oldStatus] || oldStatus,
    NEW_STATUS: statusMap[newStatus] || newStatus,
    NEW_STATUS_COLOR: statusColorMap[newStatus] || "#6b7280",
    UPDATED_BY: updatedBy?.fullName || updatedBy?.email || "System",
  };
}

/**
 * Get variables untuk SLA warning
 */
export function getSlaVariables(dueDate: Date | null): EmailVariables {
  if (!dueDate) {
    return {
      SLA_DEADLINE: "-",
      TIME_REMAINING: "-",
    };
  }

  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let timeRemaining = "";
  if (diffMs < 0) {
    timeRemaining = "Overdue";
  } else if (diffHours > 24) {
    const days = Math.floor(diffHours / 24);
    timeRemaining = `${days} hari ${diffHours % 24} jam`;
  } else if (diffHours > 0) {
    timeRemaining = `${diffHours} jam ${diffMinutes} menit`;
  } else {
    timeRemaining = `${diffMinutes} menit`;
  }

  return {
    SLA_DEADLINE: formatDateTime(dueDate),
    TIME_REMAINING: timeRemaining,
  };
}

/**
 * Get variables untuk resolved ticket
 */
export function getResolutionVariables(
  ticket: Ticket,
  resolutionNote?: string
): EmailVariables {
  const resolvedAt = ticket.resolvedAt || new Date();
  const createdAt = ticket.createdAt;
  const diffMs = resolvedAt.getTime() - createdAt.getTime();
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  let resolutionTime = "";
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    resolutionTime = `${days} hari ${hours % 24} jam`;
  } else if (hours > 0) {
    resolutionTime = `${hours} jam ${minutes} menit`;
  } else {
    resolutionTime = `${minutes} menit`;
  }

  return {
    RESOLUTION_NOTE: resolutionNote || "Ticket telah diselesaikan.",
    RESOLUTION_TIME: resolutionTime,
  };
}

/**
 * Get variables untuk rating/satisfaction survey
 */
export function getRatingVariables(ticketId: string): EmailVariables {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    RATING_URL_1: `${baseUrl}/rate?ticket=${ticketId}&rating=1`,
    RATING_URL_2: `${baseUrl}/rate?ticket=${ticketId}&rating=2`,
    RATING_URL_3: `${baseUrl}/rate?ticket=${ticketId}&rating=3`,
    RATING_URL_4: `${baseUrl}/rate?ticket=${ticketId}&rating=4`,
    RATING_URL_5: `${baseUrl}/rate?ticket=${ticketId}&rating=5`,
  };
}

/**
 * Get variables untuk attachment info
 */
export function getAttachmentVariables(attachmentCount: number): EmailVariables {
  return {
    HAS_ATTACHMENTS: attachmentCount > 0 ? "true" : "",
    ATTACHMENT_COUNT: attachmentCount.toString(),
  };
}

/**
 * Get variables untuk progress updates
 */
export function getProgressVariables(options: {
  type: string;
  icon: string;
  detail?: string;
  statusChanged?: boolean;
}): EmailVariables {
  return {
    PROGRESS_TYPE: options.type,
    PROGRESS_ICON: options.icon,
    PROGRESS_DATE: formatDateTime(new Date()),
    PROGRESS_DETAIL: options.detail || "",
    STATUS_CHANGED: options.statusChanged ? "true" : "",
  };
}

// Type untuk user account email
export type UserAccountForEmail = {
  id: string;
  email: string;
  fullName?: string | null;
  username?: string | null;
  role: string;
  level?: {
    code: string;
    name: string;
  } | null;
};

/**
 * Get variables untuk user account (untuk email welcome/account created)
 */
export function getUserAccountVariables(
  user: UserAccountForEmail,
  password: string
): EmailVariables {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  const roleMap: Record<string, string> = {
    admin: "Administrator",
    agent: "Agent",
  };

  return {
    USER_NAME: user.fullName || user.username || user.email,
    USER_EMAIL: user.email,
    USER_USERNAME: user.username || "",
    USER_PASSWORD: password,
    USER_ROLE: roleMap[user.role] || user.role,
    USER_LEVEL: user.level ? `${user.level.code} - ${user.level.name}` : "-",
    LOGIN_URL: `${baseUrl}/admin/login`,
  };
}

/**
 * Build variables untuk user account email
 */
export function buildUserAccountVariables(
  user: UserAccountForEmail,
  password: string
): EmailVariables {
  return {
    ...getGlobalVariables(),
    ...getUserAccountVariables(user, password),
  };
}

/**
 * Combine semua variables untuk template tertentu
 */
export function buildEmailVariables(
  ticket: TicketWithRelations,
  options?: {
    reply?: ReplyWithAuthor;
    oldStatus?: string;
    newStatus?: string;
    updatedBy?: ProfileForEmail | null;
    assignedBy?: ProfileForEmail | null;
    resolutionNote?: string;
  }
): EmailVariables {
  const variables: EmailVariables = {
    ...getGlobalVariables(),
    ...getTicketVariables(ticket),
    ...getCustomerVariables(ticket),
    ...getAgentVariables(ticket.assignee ?? null),
    ...getSlaVariables(ticket.dueDate),
  };

  // Add reply variables if provided
  if (options?.reply) {
    Object.assign(variables, getReplyVariables(options.reply));
  }

  // Add status change variables if provided
  if (options?.oldStatus && options?.newStatus) {
    Object.assign(
      variables,
      getStatusChangeVariables(options.oldStatus, options.newStatus, options.updatedBy)
    );
  }

  // Add assignedBy if provided
  if (options?.assignedBy) {
    variables.ASSIGNED_BY = options.assignedBy.fullName || options.assignedBy.email;
  }

  // Add resolution variables (always include for closed tickets)
  Object.assign(variables, getResolutionVariables(ticket, options?.resolutionNote));

  // Add rating variables
  Object.assign(variables, getRatingVariables(ticket.id));

  // Add creator variables for agent notifications
  if (ticket.createdBy) {
    variables.CREATOR_NAME = ticket.createdBy.fullName || ticket.createdBy.email;
  }

  return variables;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getInitial(name: string): string {
  if (!name) return "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}
