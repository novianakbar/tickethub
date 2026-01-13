import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper: slugify string
function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// GET /api/categories - List all categories
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get("active") === "true";

        const categories = await prisma.category.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });

        return NextResponse.json({ categories });
    } catch (error) {
        console.error("Categories fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/categories - Create new category
export async function POST(request: Request) {
    try {
        // Auth check
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is admin
        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
        });

        if (!profile || profile.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, description, color, icon } = body;

        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Generate unique slug
        let slug = slugify(name);
        const existingSlug = await prisma.category.findUnique({
            where: { slug },
        });

        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        // Get next sort order
        const lastCategory = await prisma.category.findFirst({
            orderBy: { sortOrder: "desc" },
        });
        const sortOrder = (lastCategory?.sortOrder ?? -1) + 1;

        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                slug,
                description: description?.trim() || null,
                color: color || "#6B7280",
                icon: icon || null,
                sortOrder,
            },
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        console.error("Category create error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
