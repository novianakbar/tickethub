import { prisma } from "@/lib/prisma";
import { SMTPService } from "@/lib/smtp";
import { logEmailSent, logEmailFailed, logEmailSkipped } from "@/lib/email-logger";
import {
  buildEmailVariables,
  EmailVariables,
  TicketWithRelations,
  ReplyWithAuthor,
  ProfileForEmail,
  getAttachmentVariables,
  getProgressVariables,
  UserAccountForEmail,
  buildUserAccountVariables,
} from "@/lib/email-variables";

// ============================================
// CORE EMAIL SERVICE
// ============================================

/**
 * Load email template dari database berdasarkan alias
 * Return null jika tidak ditemukan
 */
export async function loadTemplate(alias: string) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { alias },
    });

    if (!template || !template.isActive) {
      return null;
    }

    return template;
  } catch (error) {
    console.error(`[EmailService] Error loading template ${alias}:`, error);
    return null;
  }
}

/**
 * Replace semua {{VARIABLE}} dalam template dengan nilai aktual
 * Juga handle Handlebars-style conditionals {{#if}}...{{/if}}
 */
export function renderTemplate(
  content: string,
  variables: EmailVariables
): string {
  let rendered = content;

  // 1. Handle {{#if VARIABLE}}...{{/if}} conditionals
  // Pattern: {{#if VAR}}content{{/if}} atau {{#if VAR}}content{{else}}other{{/if}}
  const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;
  rendered = rendered.replace(ifRegex, (match, varName, ifContent, elseContent = "") => {
    const value = variables[varName];
    // Truthy check: non-empty string, not "false", not "0"
    const isTruthy = value && value !== "false" && value !== "0" && value.trim() !== "";
    return isTruthy ? ifContent : elseContent;
  });

  // 2. Handle {{#unless VARIABLE}}...{{/unless}} conditionals
  const unlessRegex = /\{\{#unless\s+(\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
  rendered = rendered.replace(unlessRegex, (match, varName, content) => {
    const value = variables[varName];
    const isTruthy = value && value !== "false" && value !== "0" && value.trim() !== "";
    return isTruthy ? "" : content;
  });

  // 3. Replace all {{VARIABLE}} with values
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    rendered = rendered.replace(regex, value || "");
  }

  // 4. Clean up any remaining unmatched variables (replace with empty)
  rendered = rendered.replace(/\{\{[A-Z_0-9]+\}\}/g, "");

  return rendered;
}

/**
 * Cek apakah email ke customer diaktifkan di general settings
 */
export async function isCustomerEmailEnabled(): Promise<boolean> {
  try {
    const setting = await prisma.appSettings.findUnique({
      where: { key: "emailCustomerEnabled" },
    });

    // Default true jika belum ada setting
    return setting?.value !== "false";
  } catch (error) {
    console.error("[EmailService] Error checking customer email setting:", error);
    return true; // Default enabled
  }
}

/**
 * Cek preference agent untuk notifikasi tertentu
 */
export async function checkAgentPreference(
  agentId: string,
  preferenceField:
    | "notifyOnAssigned"
    | "notifyOnCustomerReply"
    | "notifySlaWarning"
    | "notifyTicketProgress"
    | "notifyOnUnassigned"
): Promise<boolean> {
  try {
    const agent = await prisma.profile.findUnique({
      where: { id: agentId },
    });

    if (!agent) return true;

    // Access the field dynamically
    const value = agent[preferenceField as keyof typeof agent];

    // Default true jika tidak ditemukan atau undefined
    return value !== false;
  } catch (error) {
    console.error("[EmailService] Error checking agent preference:", error);
    return true;
  }
}

interface SendNotificationParams {
  templateCode: string;
  recipient: string;
  variables: EmailVariables;
  ticketId?: string;
}

/**
 * Core function untuk mengirim email notification
 * TIDAK throw error - hanya log jika gagal
 */
export async function sendNotification(
  params: SendNotificationParams
): Promise<boolean> {
  const { templateCode, recipient, variables, ticketId } = params;

  try {
    // 1. Load template
    const template = await loadTemplate(templateCode);

    if (!template) {
      console.warn(
        `[EmailService] Template ${templateCode} not found or inactive, skipping...`
      );
      await logEmailSkipped(
        templateCode,
        recipient,
        "Template not found or inactive",
        ticketId
      );
      return false;
    }

    // 2. Render subject dan content
    const subject = renderTemplate(template.subject, variables);
    const html = renderTemplate(template.content, variables);

    // 3. Kirim email via SMTP
    const smtpService = new SMTPService();
    await smtpService.sendEmail({
      to: recipient,
      subject,
      html,
    });

    // 4. Log sukses
    await logEmailSent(templateCode, recipient, subject, ticketId);
    console.log(`[EmailService] ✅ Sent ${templateCode} to ${recipient}`);

    return true;
  } catch (error) {
    // 5. Log error tapi TIDAK throw
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[EmailService] ❌ Failed to send ${templateCode} to ${recipient}:`,
      errorMessage
    );
    await logEmailFailed(
      templateCode,
      recipient,
      "(failed)",
      errorMessage,
      ticketId
    );

    return false;
  }
}

// ============================================
// CUSTOMER NOTIFICATION FUNCTIONS
// ============================================

/**
 * Kirim email TICKET_CREATED ke customer
 */
export async function notifyTicketCreated(
  ticket: TicketWithRelations
): Promise<void> {
  // Cek apakah email customer enabled
  if (!(await isCustomerEmailEnabled())) {
    await logEmailSkipped(
      "TICKET_CREATED",
      ticket.customerEmail,
      "Customer email disabled",
      ticket.id
    );
    return;
  }

  const variables = buildEmailVariables(ticket);

  await sendNotification({
    templateCode: "TICKET_CREATED",
    recipient: ticket.customerEmail,
    variables,
    ticketId: ticket.id,
  });
}

/**
 * Kirim email TICKET_ASSIGNED ke customer
 */
export async function notifyTicketAssigned(
  ticket: TicketWithRelations,
  assignedBy?: ProfileForEmail | null
): Promise<void> {
  if (!(await isCustomerEmailEnabled())) {
    await logEmailSkipped(
      "TICKET_ASSIGNED",
      ticket.customerEmail,
      "Customer email disabled",
      ticket.id
    );
    return;
  }

  const variables = buildEmailVariables(ticket, { assignedBy });

  await sendNotification({
    templateCode: "TICKET_ASSIGNED",
    recipient: ticket.customerEmail,
    variables,
    ticketId: ticket.id,
  });
}

/**
 * Kirim email TICKET_STATUS_CHANGED ke customer
 */
export async function notifyStatusChanged(
  ticket: TicketWithRelations,
  oldStatus: string,
  newStatus: string,
  updatedBy?: ProfileForEmail | null
): Promise<void> {
  if (!(await isCustomerEmailEnabled())) {
    await logEmailSkipped(
      "TICKET_STATUS_CHANGED",
      ticket.customerEmail,
      "Customer email disabled",
      ticket.id
    );
    return;
  }

  const variables = buildEmailVariables(ticket, {
    oldStatus,
    newStatus,
    updatedBy,
  });

  await sendNotification({
    templateCode: "TICKET_STATUS_CHANGED",
    recipient: ticket.customerEmail,
    variables,
    ticketId: ticket.id,
  });
}

/**
 * Kirim email TICKET_NEW_REPLY ke customer
 */
export async function notifyNewReply(
  ticket: TicketWithRelations,
  reply: ReplyWithAuthor
): Promise<void> {
  if (!(await isCustomerEmailEnabled())) {
    await logEmailSkipped(
      "TICKET_NEW_REPLY",
      ticket.customerEmail,
      "Customer email disabled",
      ticket.id
    );
    return;
  }

  const variables = buildEmailVariables(ticket, { reply });

  await sendNotification({
    templateCode: "TICKET_NEW_REPLY",
    recipient: ticket.customerEmail,
    variables,
    ticketId: ticket.id,
  });
}

/**
 * Kirim email TICKET_RESOLVED ke customer
 */
export async function notifyTicketResolved(
  ticket: TicketWithRelations,
  resolutionNote?: string
): Promise<void> {
  if (!(await isCustomerEmailEnabled())) {
    await logEmailSkipped(
      "TICKET_RESOLVED",
      ticket.customerEmail,
      "Customer email disabled",
      ticket.id
    );
    return;
  }

  const variables = buildEmailVariables(ticket, { resolutionNote });

  await sendNotification({
    templateCode: "TICKET_RESOLVED",
    recipient: ticket.customerEmail,
    variables,
    ticketId: ticket.id,
  });
}

/**
 * Kirim email TICKET_CLOSED ke customer
 */
export async function notifyTicketClosed(
  ticket: TicketWithRelations
): Promise<void> {
  if (!(await isCustomerEmailEnabled())) {
    await logEmailSkipped(
      "TICKET_CLOSED",
      ticket.customerEmail,
      "Customer email disabled",
      ticket.id
    );
    return;
  }

  const variables = buildEmailVariables(ticket);

  await sendNotification({
    templateCode: "TICKET_CLOSED",
    recipient: ticket.customerEmail,
    variables,
    ticketId: ticket.id,
  });
}

// ============================================
// AGENT NOTIFICATION FUNCTIONS
// ============================================

/**
 * Kirim email AGENT_TICKET_ASSIGNED ke agent yang baru di-assign
 */
export async function notifyAgentAssigned(
  ticket: TicketWithRelations,
  agent: ProfileForEmail,
  assignedBy?: ProfileForEmail | null
): Promise<void> {
  // Cek preference agent
  if (!(await checkAgentPreference(agent.id, "notifyOnAssigned"))) {
    await logEmailSkipped(
      "AGENT_TICKET_ASSIGNED",
      agent.email,
      "Agent preference disabled",
      ticket.id
    );
    return;
  }

  const variables = buildEmailVariables(ticket, { assignedBy });

  await sendNotification({
    templateCode: "AGENT_TICKET_ASSIGNED",
    recipient: agent.email,
    variables,
    ticketId: ticket.id,
  });
}

/**
 * Kirim email ke agent lama saat ticket di-reassign
 * Menggunakan AGENT_TICKET_PROGRESS dengan context unassigned
 */
export async function notifyAgentUnassigned(
  ticket: TicketWithRelations,
  oldAgent: ProfileForEmail,
  newAgent: ProfileForEmail
): Promise<void> {
  // Cek preference agent
  if (!(await checkAgentPreference(oldAgent.id, "notifyOnUnassigned"))) {
    await logEmailSkipped(
      "AGENT_TICKET_PROGRESS",
      oldAgent.email,
      "Agent preference disabled",
      ticket.id
    );
    return;
  }

  const variables = {
    ...buildEmailVariables(ticket),
    ...getProgressVariables({
      type: "Reassigned",
      icon: "🔄",
      detail: `Ticket telah dialihkan ke ${newAgent.fullName || newAgent.email}`,
      statusChanged: false,
    }),
  };

  await sendNotification({
    templateCode: "AGENT_TICKET_PROGRESS",
    recipient: oldAgent.email,
    variables,
    ticketId: ticket.id,
  });
}

/**
 * Kirim email AGENT_CUSTOMER_REPLY ke agent saat customer membalas
 */
export async function notifyAgentCustomerReply(
  ticket: TicketWithRelations,
  reply: ReplyWithAuthor
): Promise<void> {
  if (!ticket.assignee) {
    console.log("[EmailService] No assignee for ticket, skipping agent notification");
    return;
  }

  // Cek preference agent
  if (!(await checkAgentPreference(ticket.assignee.id, "notifyOnCustomerReply"))) {
    await logEmailSkipped(
      "AGENT_CUSTOMER_REPLY",
      ticket.assignee.email,
      "Agent preference disabled",
      ticket.id
    );
    return;
  }

  const variables = {
    ...buildEmailVariables(ticket, { reply }),
    ...getAttachmentVariables(0), // Customer replies via public form don't have attachments yet
  };

  await sendNotification({
    templateCode: "AGENT_CUSTOMER_REPLY",
    recipient: ticket.assignee.email,
    variables,
    ticketId: ticket.id,
  });
}

/**
 * Kirim email AGENT_TICKET_PROGRESS ke creator ticket
 */
export async function notifyAgentTicketProgress(
  ticket: TicketWithRelations,
  oldStatus: string,
  newStatus: string,
  updatedBy?: ProfileForEmail | null
): Promise<void> {
  if (!ticket.createdBy) {
    return;
  }

  // Jangan notify creator jika dia yang update
  if (updatedBy && updatedBy.id === ticket.createdBy.id) {
    return;
  }

  // Cek preference agent
  if (!(await checkAgentPreference(ticket.createdBy.id, "notifyTicketProgress"))) {
    await logEmailSkipped(
      "AGENT_TICKET_PROGRESS",
      ticket.createdBy.email,
      "Agent preference disabled",
      ticket.id
    );
    return;
  }

  const variables = {
    ...buildEmailVariables(ticket, { oldStatus, newStatus, updatedBy }),
    ...getProgressVariables({
      type: "Status Update",
      icon: "📊",
      detail: `Status berubah dari ${oldStatus} menjadi ${newStatus}`,
      statusChanged: true,
    }),
  };

  await sendNotification({
    templateCode: "AGENT_TICKET_PROGRESS",
    recipient: ticket.createdBy.email,
    variables,
    ticketId: ticket.id,
  });
}

/**
 * Kirim email AGENT_SLA_WARNING ke agent
 */
export async function notifyAgentSlaWarning(
  ticket: TicketWithRelations
): Promise<void> {
  if (!ticket.assignee) {
    return;
  }

  // Cek preference agent
  if (!(await checkAgentPreference(ticket.assignee.id, "notifySlaWarning"))) {
    await logEmailSkipped(
      "AGENT_SLA_WARNING",
      ticket.assignee.email,
      "Agent preference disabled",
      ticket.id
    );
    return;
  }

  const variables = buildEmailVariables(ticket);

  await sendNotification({
    templateCode: "AGENT_SLA_WARNING",
    recipient: ticket.assignee.email,
    variables,
    ticketId: ticket.id,
  });
}

// ============================================
// USER ACCOUNT NOTIFICATION FUNCTIONS
// ============================================

/**
 * Kirim email USER_ACCOUNT_CREATED ke user baru
 * Berisi informasi login (email dan password sementara)
 */
export async function notifyUserAccountCreated(
  user: UserAccountForEmail,
  password: string
): Promise<boolean> {
  const variables = buildUserAccountVariables(user, password);

  return await sendNotification({
    templateCode: "USER_ACCOUNT_CREATED",
    recipient: user.email,
    variables,
  });
}

/**
 * Kirim email USER_PASSWORD_RESET ke user saat admin mereset password
 * Berisi informasi login dengan password baru
 */
export async function notifyPasswordReset(
  user: UserAccountForEmail,
  password: string
): Promise<boolean> {
  const variables = buildUserAccountVariables(user, password);

  return await sendNotification({
    templateCode: "USER_PASSWORD_RESET",
    recipient: user.email,
    variables,
  });
}