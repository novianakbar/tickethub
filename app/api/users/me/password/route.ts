import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Password saat ini harus diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password harus diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru dan konfirmasi tidak cocok",
    path: ["confirmPassword"],
});

// PUT /api/users/me/password - Change current user's password
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = changePasswordSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.issues[0].message },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = validationResult.data;

        // Get current user with password
        const user = await prisma.profile.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                password: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Password saat ini salah" },
                { status: 400 }
            );
        }

        // Check if new password is same as current
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return NextResponse.json(
                { error: "Password baru tidak boleh sama dengan password lama" },
                { status: 400 }
            );
        }

        // Hash and update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.profile.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        return NextResponse.json({
            success: true,
            message: "Password berhasil diubah. Silakan login kembali dengan password baru.",
        });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
