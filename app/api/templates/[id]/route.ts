import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const updateTemplateSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    subject: z.string().min(1, "Subject is required").optional(),
    content: z.string().min(1, "Content is required").optional(),
    categoryId: z.string().optional().nullable(),
    priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
});

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const template = await prisma.ticketTemplate.findUnique({
            where: {
                id: id,
            },
            include: {
                category: true,
            },
        });

        if (!template) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(template);
    } catch (error) {
        console.error("[TEMPLATE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const json = await req.json();
        const body = updateTemplateSchema.parse(json);

        const template = await prisma.ticketTemplate.update({
            where: {
                id: id,
            },
            data: body,
        });

        return NextResponse.json(template);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[TEMPLATE_UPDATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const template = await prisma.ticketTemplate.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error("[TEMPLATE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
