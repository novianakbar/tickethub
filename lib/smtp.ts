import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export interface SMTPConfigOverride {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    fromEmail: string;
    fromName: string;
}

export class SMTPService {
    private transporter: nodemailer.Transporter | null = null;
    private config: SMTPConfigOverride | null = null;

    constructor(config?: SMTPConfigOverride) {
        if (config) {
            this.config = config;
            this.transporter = this.createTransporter(config);
        }
    }

    private createTransporter(config: SMTPConfigOverride) {
        return nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.username,
                pass: config.password,
            },
        });
    }

    private async init() {
        if (this.transporter) return;

        // Fetch default config from DB
        const config = await prisma.sMTPConfig.findFirst({
            where: { isDefault: true },
        });

        if (!config) {
            throw new Error("No default SMTP configuration found");
        }

        this.config = {
            host: config.host,
            port: config.port,
            secure: config.secure,
            username: config.username,
            password: config.password,
            fromEmail: config.fromEmail,
            fromName: config.fromName,
        };

        this.transporter = this.createTransporter(this.config);
    }

    async sendEmail({ to, subject, html, text }: SendEmailOptions) {
        await this.init();

        if (!this.transporter || !this.config) {
            throw new Error("SMTP Service not initialized");
        }

        const info = await this.transporter.sendMail({
            from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
            to,
            subject,
            html,
            text,
        });

        return info;
    }

    async verifyConnection() {
        await this.init();

        if (!this.transporter) {
            throw new Error("SMTP Service not initialized");
        }

        return this.transporter.verify();
    }
}
