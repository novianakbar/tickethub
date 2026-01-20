import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { generateRandomPassword } from "@/lib/utils";
import { notifyPasswordReset } from "@/lib/email-service";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        // Find the user to reset password
        const user = await prisma.profile.findUnique({
            where: { id },
            include: {
                level: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
        }

        if (!user.isActive) {
            return NextResponse.json({ error: "User tidak aktif" }, { status: 400 });
        }

        // Prevent admin from resetting their own password through this endpoint
        if (user.id === session.user.id) {
            return NextResponse.json(
                { error: "Tidak dapat mereset password sendiri melalui fitur ini" },
                { status: 400 }
            );
        }

        // Generate new random password
        const newPassword = generateRandomPassword();
        const hashedPassword = await hash(newPassword, 10);

        // Update password in database
        await prisma.profile.update({
            where: { id },
            data: { password: hashedPassword },
        });

        // Send email notification with new password (fire-and-forget)
        notifyPasswordReset(
            {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                role: user.role,
                level: user.level,
            },
            newPassword
        );

        return NextResponse.json({
            success: true,
            message: "Password berhasil direset dan dikirim ke email user",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Gagal mereset password" }, { status: 500 });
    }
}
