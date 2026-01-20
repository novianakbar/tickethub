import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/agents - Get list of active agents for assignment
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch active agents (users with role agent or admin)
        const agents = await prisma.profile.findMany({
            where: {
                isActive: true,
                role: {
                    in: ["agent", "admin"],
                },
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                level: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                { role: "asc" }, // admin first
                { fullName: "asc" },
            ],
        });

        return NextResponse.json({ agents });
    } catch (error) {
        console.error("Fetch agents error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
