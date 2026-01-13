import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/support-levels - List all support levels
export async function GET() {
    try {
        const levels = await prisma.supportLevel.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: {
                id: true,
                code: true,
                name: true,
                description: true,
                sortOrder: true,
                canViewOwnTickets: true,
                canViewTeamTickets: true,
                canViewAllTickets: true,
                canCreateTicket: true,
                canAssignTicket: true,
                canEscalateTicket: true,
                canResolveTicket: true,
                canCloseTicket: true,
            },
        });

        return NextResponse.json({ levels });
    } catch (error) {
        console.error("Support levels list error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/support-levels - Create new support level (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if admin
        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
        });

        if (!profile || profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

        // Validation
        if (!code || !name) {
            return NextResponse.json({ error: "Code dan name wajib diisi" }, { status: 400 });
        }

        // Check for existing code
        const existing = await prisma.supportLevel.findUnique({
            where: { code },
        });

        if (existing) {
            return NextResponse.json({ error: "Code sudah digunakan" }, { status: 400 });
        }

        const level = await prisma.supportLevel.create({
            data: {
                code,
                name,
                description: description || null,
                sortOrder: sortOrder ? Number(sortOrder) : 0,
                canViewOwnTickets: canViewOwnTickets ?? true,
                canViewTeamTickets: canViewTeamTickets ?? false,
                canViewAllTickets: canViewAllTickets ?? false,
                canCreateTicket: canCreateTicket ?? true,
                canAssignTicket: canAssignTicket ?? false,
                canEscalateTicket: canEscalateTicket ?? false,
                canResolveTicket: canResolveTicket ?? true,
                canCloseTicket: canCloseTicket ?? false,
            },
        });

        return NextResponse.json({ level }, { status: 201 });
    } catch (error) {
        console.error("Support level create error:", error);
        return NextResponse.json({ error: "Gagal membuat support level" }, { status: 500 });
    }
}
