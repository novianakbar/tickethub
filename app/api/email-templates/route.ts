import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateEmailTemplateRequest } from "@/types/email-template";

export async function GET() {
    try {
        const templates = await prisma.emailTemplate.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error("Error fetching email templates:", error);
        return NextResponse.json(
            { error: "Failed to fetch email templates" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body: CreateEmailTemplateRequest = await request.json();

        const existingTemplate = await prisma.emailTemplate.findUnique({
            where: { alias: body.alias },
        });

        if (existingTemplate) {
            return NextResponse.json(
                { error: "Template with this alias already exists" },
                { status: 400 }
            );
        }

        const template = await prisma.emailTemplate.create({
            data: {
                name: body.name,
                alias: body.alias,
                subject: body.subject,
                content: body.content,
                description: body.description,
                isActive: body.isActive ?? true,
            },
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error("Error creating email template:", error);
        return NextResponse.json(
            { error: "Failed to create email template" },
            { status: 500 }
        );
    }
}
