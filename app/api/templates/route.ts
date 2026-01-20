import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const createTemplateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    subject: z.string().min(1, "Subject is required"),
    content: z.string().min(1, "Content is required"),
    categoryId: z.string().optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
    isActive: z.boolean().default(true),
    sortOrder: z.number().default(0),
});

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const active = searchParams.get("active");
        const skip = (page - 1) * limit;

        // Build where clause
        const where: { isActive?: boolean } = {};
        if (active === "true") {
            where.isActive = true;
        } else if (active === "false") {
            where.isActive = false;
        }

        const [templates, total] = await Promise.all([
            prisma.ticketTemplate.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    sortOrder: "asc",
                },
                include: {
                    category: true,
                },
            }),
            prisma.ticketTemplate.count({ where }),
        ]);

        return NextResponse.json({
            templates,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("[TEMPLATES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}



export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const json = await req.json();
        const body = createTemplateSchema.parse(json);

        const template = await prisma.ticketTemplate.create({
            data: body,
        });

        return NextResponse.json(template);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[TEMPLATES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
