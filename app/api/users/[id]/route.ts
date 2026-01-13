import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

type RouteParams = {
    params: Promise<{ id: string }>;
};

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Auth check
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

        const user = await prisma.profile.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                role: true,
                level: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
                isActive: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("User fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Auth check
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

        // Check if target user exists
        const existingUser = await prisma.profile.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await request.json();
        const { email, username, fullName, role, levelId, avatarUrl, password } = body;

        // Validation
        if (email && !isValidEmail(email)) {
            return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
        }

        if (role && role !== "admin" && role !== "agent") {
            return NextResponse.json({ error: "Role harus 'admin' atau 'agent'" }, { status: 400 });
        }

        // Check if level exists
        if (levelId) {
            const levelExists = await prisma.supportLevel.findUnique({
                where: { id: levelId },
            });
            if (!levelExists) {
                return NextResponse.json({ error: "Level tidak ditemukan" }, { status: 400 });
            }
        }

        // Check for duplicate email (excluding current user)
        if (email && email !== existingUser.email) {
            const duplicateEmail = await prisma.profile.findUnique({
                where: { email },
            });
            if (duplicateEmail) {
                return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
            }
        }

        // Check for duplicate username (excluding current user)
        if (username && username !== existingUser.username) {
            const duplicateUsername = await prisma.profile.findUnique({
                where: { username },
            });
            if (duplicateUsername) {
                return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
            }
        }

        // Build update data
        const data: Record<string, unknown> = {};
        if (email !== undefined) data.email = email;
        if (username !== undefined) data.username = username || null;
        if (fullName !== undefined) data.fullName = fullName || null;
        if (role !== undefined) data.role = role;
        if (levelId !== undefined) data.levelId = levelId;
        if (avatarUrl !== undefined) data.avatarUrl = avatarUrl || null;
        if (password) {
            data.password = await hash(password, 10);
        }

        const user = await prisma.profile.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                role: true,
                level: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
                isActive: true,
            },
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error("User update error:", error);
        return NextResponse.json({ error: "Gagal mengupdate user" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Auth check
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

        // Prevent self-deletion
        if (id === session.user.id) {
            return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
        }

        // Check if target user exists
        const existingUser = await prisma.profile.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Soft delete: set isActive = false
        const user = await prisma.profile.update({
            where: { id },
            data: { isActive: false },
            select: {
                id: true,
                email: true,
                isActive: true,
            },
        });

        return NextResponse.json({ user, message: "User berhasil dinonaktifkan" });
    } catch (error) {
        console.error("User delete error:", error);
        return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
    }
}

