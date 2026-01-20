import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateEmailTemplateRequest } from "@/types/email-template";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const template = await prisma.emailTemplate.findUnique({
            where: { id },
        });

        if (!template) {
            return NextResponse.json(
                { error: "Email template not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(template);
    } catch (error) {
        console.error("Error fetching email template:", error);
        return NextResponse.json(
            { error: "Failed to fetch email template" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: UpdateEmailTemplateRequest = await request.json();

        // Check if alias is being updated and conflicts
        if (body.alias) {
            const existing = await prisma.emailTemplate.findUnique({
                where: { alias: body.alias },
            });
            if (existing && existing.id !== id) {
                return NextResponse.json(
                    { error: "Template with this alias already exists" },
                    { status: 400 }
                );
            }
        }

        const template = await prisma.emailTemplate.update({
            where: { id },
            data: {
                ...body,
            },
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error("Error updating email template:", error);
        return NextResponse.json(
            { error: "Failed to update email template" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.emailTemplate.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting email template:", error);
        return NextResponse.json(
            { error: "Failed to delete email template" },
            { status: 500 }
        );
    }
}
