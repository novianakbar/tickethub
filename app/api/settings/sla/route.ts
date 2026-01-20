import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/settings/sla - List all SLA configs
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const configs = await prisma.sLAConfig.findMany({
            orderBy: { priority: "asc" },
        });

        return NextResponse.json({ configs });
    } catch (error) {
        console.error("SLA config fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/settings/sla - Update SLA config
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
        });

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { id, durationHrs, description, isActive } = body;

        if (!id || typeof durationHrs !== "number" || durationHrs < 1) {
            return NextResponse.json(
                { error: "Invalid data" },
                { status: 400 }
            );
        }

        const updated = await prisma.sLAConfig.update({
            where: { id },
            data: {
                durationHrs,
                description: description || null,
                isActive: typeof isActive === "boolean" ? isActive : undefined,
            },
        });

        return NextResponse.json({ config: updated });
    } catch (error) {
        console.error("SLA config update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
