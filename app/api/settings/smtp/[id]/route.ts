import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const updateSchema = z.object({
    name: z.string().min(1).optional(),
    host: z.string().min(1).optional(),
    port: z.number().int().positive().optional(),
    secure: z.boolean().optional(),
    username: z.string().min(1).optional(),
    password: z.string().min(1).optional(),
    fromName: z.string().min(1).optional(),
    fromEmail: z.string().email().optional(),
    isDefault: z.boolean().optional(),
});

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const result = updateSchema.safeParse(body);

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
                where: {
                    id: { not: id },
                    isDefault: true
                },
                data: { isDefault: false },
            });
        }

        const updatedConfig = await prisma.sMTPConfig.update({
            where: { id },
            data,
        });

        return NextResponse.json(updatedConfig);
    } catch (error) {
        console.error("Failed to update SMTP config:", error);
        return NextResponse.json(
            { error: "Failed to update SMTP config" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if it's the default one
        const config = await prisma.sMTPConfig.findUnique({
            where: { id },
        });

        if (!config) {
            return NextResponse.json({ error: "Config not found" }, { status: 404 });
        }

        if (config.isDefault) {
            return NextResponse.json(
                { error: "Cannot delete the default configuration. Please set another default first." },
                { status: 400 }
            );
        }

        await prisma.sMTPConfig.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete SMTP config:", error);
        return NextResponse.json(
            { error: "Failed to delete SMTP config" },
            { status: 500 }
        );
    }
}
