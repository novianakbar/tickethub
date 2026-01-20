import { NextRequest, NextResponse } from "next/server";
import { SMTPService } from "@/lib/smtp";
import { getServerSession } from "next-auth"; // Adjust auth import based on project
// Assuming auth is handled or we use a simpler permissions check if available

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { config, to } = body;

        if (!to) {
            return NextResponse.json(
                { error: "Target email address is required" },
                { status: 400 }
            );
        }

        const smtpService = new SMTPService(config); // Use provided config for testing

        // Verify connection first
        await smtpService.verifyConnection();

        // Send test email
        await smtpService.sendEmail({
            to,
            subject: "Test Email from TicketHub",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>SMTP Configuration Test</h2>
                    <p>This is a test email to verify your SMTP configuration.</p>
                    <p><strong>Configuration Used:</strong></p>
                    <ul>
                        <li>Host: ${config.host}</li>
                        <li>Port: ${config.port}</li>
                        <li>Username: ${config.username}</li>
                        <li>Secure: ${config.secure ? "Yes" : "No"}</li>
                    </ul>
                    <p style="color: green; font-weight: bold;">Connection Successful!</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true, message: "Test email sent successfully" });
    } catch (error: any) {
        console.error("SMTP Test Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to send test email" },
            { status: 500 }
        );
    }
}
