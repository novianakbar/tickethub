// Public Ticket Session Helper
// Manages sessionStorage for verified ticket access

import type { PublicTicket, VerifiedTicketSession } from "@/types/public-ticket";

const SESSION_KEY_PREFIX = "verified_ticket_";
const SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Save verified ticket data to sessionStorage
 */
export function saveVerifiedTicket(
    ticketNumber: string,
    email: string,
    ticket: PublicTicket
): void {
    const session: VerifiedTicketSession = {
        ticketNumber: ticketNumber.toUpperCase(),
        email: email.toLowerCase(),
        ticket,
        verifiedAt: Date.now(),
    };

    try {
        sessionStorage.setItem(
            SESSION_KEY_PREFIX + ticketNumber.toUpperCase(),
            JSON.stringify(session)
        );
    } catch (error) {
        console.error("Failed to save ticket session:", error);
    }
}

/**
 * Get verified ticket data from sessionStorage
 * Returns null if not found or expired
 */
export function getVerifiedTicket(ticketNumber: string): VerifiedTicketSession | null {
    try {
        const data = sessionStorage.getItem(SESSION_KEY_PREFIX + ticketNumber.toUpperCase());
        if (!data) return null;

        const session: VerifiedTicketSession = JSON.parse(data);

        // Check if session expired
        if (Date.now() - session.verifiedAt > SESSION_EXPIRY_MS) {
            clearVerifiedTicket(ticketNumber);
            return null;
        }

        return session;
    } catch (error) {
        console.error("Failed to get ticket session:", error);
        return null;
    }
}

/**
 * Clear verified ticket from sessionStorage
 */
export function clearVerifiedTicket(ticketNumber: string): void {
    try {
        sessionStorage.removeItem(SESSION_KEY_PREFIX + ticketNumber.toUpperCase());
    } catch (error) {
        console.error("Failed to clear ticket session:", error);
    }
}

/**
 * Check if a ticket is verified (exists in session and not expired)
 */
export function isTicketVerified(ticketNumber: string): boolean {
    return getVerifiedTicket(ticketNumber) !== null;
}
