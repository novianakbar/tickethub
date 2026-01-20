import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const createSchema = z.object({
    name: z.string().min(1),
    host: z.string().min(1),
    port: z.number().int().positive(),
    secure: z.boolean().default(true),
    username: z.string().min(1),
    password: z.string().min(1),
    fromName: z.string().min(1),
    fromEmail: z.string().email(),
    isDefault: z.boolean().default(false),
});

export async function GET() {
    try {
        const configs = await prisma.sMTPConfig.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(configs);
    } catch (error) {
        console.error("Failed to fetch SMTP configs:", error);
        return NextResponse.json(
            { error: "Failed to fetch SMTP configs" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = createSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid request data", details: result.error.issues },
                { status: 400 }
            );
        }

        const { data } = result;

        // If setting as default, unset others first
        if (data.isDefault) {
            await prisma.sMTPConfig.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        // Check if this is the first config, make it default if so
        const count = await prisma.sMTPConfig.count();
        if (count === 0) {
            data.isDefault = true;
        }

        const newConfig = await prisma.sMTPConfig.create({
            data: {
                name: data.name,
                host: data.host,
                port: data.port,
                secure: data.secure,
                username: data.username,
                password: data.password,
                fromName: data.fromName,
                fromEmail: data.fromEmail,
                isDefault: data.isDefault,
            },
        });

        return NextResponse.json(newConfig, { status: 201 });
    } catch (error) {
        console.error("Failed to create SMTP config:", error);
        return NextResponse.json(
            { error: "Failed to create SMTP config" },
            { status: 500 }
        );
    }
}
