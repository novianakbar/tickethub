import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
    fullName: z.string().min(1, "Nama lengkap harus diisi").max(100).optional(),
    username: z.string().min(3, "Username minimal 3 karakter").max(50).regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore").optional(),
    avatarUrl: z.string().url("URL avatar tidak valid").optional().nullable(),
});

// GET /api/users/me/profile - Get current user's profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
                level: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Get profile error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/users/me/profile - Update current user's profile
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = updateProfileSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.issues[0].message },
                { status: 400 }
            );
        }

        const { fullName, username, avatarUrl } = validationResult.data;

        // Check username uniqueness if being updated
        if (username) {
            const existingUser = await prisma.profile.findFirst({
                where: {
                    username,
                    id: { not: session.user.id },
                },
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: "Username sudah digunakan" },
                    { status: 400 }
                );
            }
        }

        // Build update data
        const updateData: Record<string, string | null | undefined> = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (username !== undefined) updateData.username = username;
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "Tidak ada data yang diupdate" },
                { status: 400 }
            );
        }

        const profile = await prisma.profile.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
                level: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
