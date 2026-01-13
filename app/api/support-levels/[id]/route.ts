import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = {
    params: Promise<{ id: string }>;
};

// GET /api/support-levels/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const level = await prisma.supportLevel.findUnique({
            where: { id },
        });

        if (!level) {
            return NextResponse.json({ error: "Support level not found" }, { status: 404 });
        }

        return NextResponse.json({ level });
    } catch (error) {
        console.error("Support level fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/support-levels/:id
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
        });

        if (!profile || profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const existing = await prisma.supportLevel.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Support level not found" }, { status: 404 });
        }

        const body = await request.json();
        const {
            code,
            name,
            description,
            sortOrder,
            canViewOwnTickets,
            canViewTeamTickets,
            canViewAllTickets,
            canCreateTicket,
            canAssignTicket,
            canEscalateTicket,
            canResolveTicket,
            canCloseTicket,
        } = body;

        // Check for duplicate code
        if (code && code !== existing.code) {
            const duplicate = await prisma.supportLevel.findUnique({
                where: { code },
            });
            if (duplicate) {
                return NextResponse.json({ error: "Code sudah digunakan" }, { status: 400 });
            }
        }

        const data: Record<string, unknown> = {};
        if (code !== undefined) data.code = code;
        if (name !== undefined) data.name = name;
        if (description !== undefined) data.description = description;
        if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
        if (canViewOwnTickets !== undefined) data.canViewOwnTickets = canViewOwnTickets;
        if (canViewTeamTickets !== undefined) data.canViewTeamTickets = canViewTeamTickets;
        if (canViewAllTickets !== undefined) data.canViewAllTickets = canViewAllTickets;
        if (canCreateTicket !== undefined) data.canCreateTicket = canCreateTicket;
        if (canAssignTicket !== undefined) data.canAssignTicket = canAssignTicket;
        if (canEscalateTicket !== undefined) data.canEscalateTicket = canEscalateTicket;
        if (canResolveTicket !== undefined) data.canResolveTicket = canResolveTicket;
        if (canCloseTicket !== undefined) data.canCloseTicket = canCloseTicket;

        const level = await prisma.supportLevel.update({
            where: { id },
            data,
        });

        return NextResponse.json({ level });
    } catch (error) {
        console.error("Support level update error:", error);
        return NextResponse.json({ error: "Gagal mengupdate support level" }, { status: 500 });
    }
}

// DELETE /api/support-levels/:id (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
        });

        if (!profile || profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const existing = await prisma.supportLevel.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Support level not found" }, { status: 404 });
        }

        // Check if any users are using this level
        const usersCount = await prisma.profile.count({
            where: { levelId: id, isActive: true },
        });

        if (usersCount > 0) {
            return NextResponse.json(
                { error: `Tidak dapat menghapus, ${usersCount} user masih menggunakan level ini` },
                { status: 400 }
            );
        }

        // Soft delete
        await prisma.supportLevel.update({
            where: { id },
            data: { isActive: false },
        });

        return NextResponse.json({ message: "Support level berhasil dinonaktifkan" });
    } catch (error) {
        console.error("Support level delete error:", error);
        return NextResponse.json({ error: "Gagal menghapus support level" }, { status: 500 });
    }
}
