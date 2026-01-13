import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

function generateRandomPassword(length = 12) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function GET(request: NextRequest) {
    try {
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

        // List users with pagination & filters
        const page = Number(request.nextUrl.searchParams.get("page") || 1);
        const pageSize = Number(request.nextUrl.searchParams.get("pageSize") || 20);
        const role = request.nextUrl.searchParams.get("role");
        const levelId = request.nextUrl.searchParams.get("levelId");

        const where: Record<string, unknown> = { isActive: true };
        if (role) where.role = role;
        if (levelId) where.levelId = levelId;

        const [users, total] = await Promise.all([
            prisma.profile.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: "desc" },
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
            }),
            prisma.profile.count({ where }),
        ]);

        return NextResponse.json({ users, total });
    } catch (error) {
        console.error("User list error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
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

        const body = await request.json();
        const { email, username, fullName, role, levelId, avatarUrl } = body;

        // Validation
        if (!email || !role || !levelId) {
            return NextResponse.json({ error: "Email, role, dan level wajib diisi" }, { status: 400 });
        }

        if (!isValidEmail(email)) {
            return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
        }

        if (role !== "admin" && role !== "agent") {
            return NextResponse.json({ error: "Role harus 'admin' atau 'agent'" }, { status: 400 });
        }

        // Check if level exists
        const levelExists = await prisma.supportLevel.findUnique({
            where: { id: levelId },
        });

        if (!levelExists) {
            return NextResponse.json({ error: "Level tidak ditemukan" }, { status: 400 });
        }

        // Check for existing email/username
        const existingEmail = await prisma.profile.findUnique({
            where: { email },
        });

        if (existingEmail) {
            return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
        }

        if (username) {
            const existingUsername = await prisma.profile.findUnique({
                where: { username },
            });

            if (existingUsername) {
                return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
            }
        }

        // Generate random password
        const password = generateRandomPassword();
        const hashed = await hash(password, 10);

        const user = await prisma.profile.create({
            data: {
                email,
                username: username || null,
                fullName: fullName || null,
                role,
                levelId,
                avatarUrl: avatarUrl || null,
                password: hashed,
                isActive: true,
            },
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

        // TODO: Send password to email (SMTP integration)
        // For now, return password in response (should be removed in production)
        return NextResponse.json({ user, tempPassword: password }, { status: 201 });
    } catch (error) {
        console.error("User create error:", error);
        return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 });
    }
}

