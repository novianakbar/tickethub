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

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/categories/[id] - Get single category
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const category = await prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ category });
    } catch (error) {
        console.error("Category fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/categories/[id] - Update category
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

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
        const { name, description, color, icon, isActive, sortOrder } = body;

        // Check category exists
        const existing = await prisma.category.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: {
            name?: string;
            slug?: string;
            description?: string | null;
            color?: string;
            icon?: string | null;
            isActive?: boolean;
            sortOrder?: number;
        } = {};

        if (name && typeof name === "string") {
            updateData.name = name.trim();
            // Update slug if name changed
            if (name.trim() !== existing.name) {
                let newSlug = slugify(name);
                const existingSlug = await prisma.category.findFirst({
                    where: { slug: newSlug, id: { not: id } },
                });
                if (existingSlug) {
                    newSlug = `${newSlug}-${Date.now()}`;
                }
                updateData.slug = newSlug;
            }
        }

        if (description !== undefined) {
            updateData.description = description?.trim() || null;
        }

        if (color) {
            updateData.color = color;
        }

        if (icon !== undefined) {
            updateData.icon = icon || null;
        }

        if (typeof isActive === "boolean") {
            updateData.isActive = isActive;
        }

        if (typeof sortOrder === "number") {
            updateData.sortOrder = sortOrder;
        }

        const category = await prisma.category.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ category });
    } catch (error) {
        console.error("Category update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/categories/[id] - Delete category (hard delete)
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

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

        // Check category exists
        const existing = await prisma.category.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        // TODO: Check if category is used by tickets before deleting

        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Category delete error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
