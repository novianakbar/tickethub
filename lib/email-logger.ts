import { prisma } from "@/lib/prisma";

// Email log status type
type EmailLogStatusType = "SENT" | "FAILED" | "SKIPPED";

interface LogEmailParams {
  templateCode: string;
  recipient: string;
  subject: string;
  status: EmailLogStatusType;
  errorMessage?: string;
  ticketId?: string;
}

/**
 * Log email ke database untuk tracking dan audit
 */
export async function logEmail(params: LogEmailParams): Promise<void> {
  try {
    await prisma.emailLog.create({
      data: {
        templateCode: params.templateCode,
        recipient: params.recipient,
        subject: params.subject,
        status: params.status,
        errorMessage: params.errorMessage,
        ticketId: params.ticketId,
      },
    });
  } catch (error) {
    // Log ke console jika gagal simpan ke database
    console.error("[EmailLogger] Failed to log email:", error);
    console.error("[EmailLogger] Email data:", params);
  }
}

/**
 * Log email yang berhasil terkirim
 */
export async function logEmailSent(
  templateCode: string,
  recipient: string,
  subject: string,
  ticketId?: string
): Promise<void> {
  await logEmail({
    templateCode,
    recipient,
    subject,
    status: "SENT",
    ticketId,
  });
}

/**
 * Log email yang gagal terkirim
 */
export async function logEmailFailed(
  templateCode: string,
  recipient: string,
  subject: string,
  errorMessage: string,
  ticketId?: string
): Promise<void> {
  await logEmail({
    templateCode,
    recipient,
    subject,
    status: "FAILED",
    errorMessage,
    ticketId,
  });
}

/**
 * Log email yang di-skip (template tidak ada, disabled, dll)
 */
export async function logEmailSkipped(
  templateCode: string,
  recipient: string,
  reason: string,
  ticketId?: string
): Promise<void> {
  await logEmail({
    templateCode,
    recipient,
    subject: "(skipped)",
    status: "SKIPPED",
    errorMessage: reason,
    ticketId,
  });
}
