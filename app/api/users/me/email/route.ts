import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const changeEmailSchema = z.object({
    newEmail: z.string().email("Format email tidak valid"),
    currentPassword: z.string().min(1, "Password saat ini harus diisi"),
});

// PUT /api/users/me/email - Change current user's email
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = changeEmailSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.issues[0].message },
                { status: 400 }
            );
        }

        const { newEmail, currentPassword } = validationResult.data;

        // Get current user with password
        const user = await prisma.profile.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
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

        // Check if new email is same as current
        if (newEmail.toLowerCase() === user.email.toLowerCase()) {
            return NextResponse.json(
                { error: "Email baru sama dengan email saat ini" },
                { status: 400 }
            );
        }

        // Check email uniqueness
        const existingUser = await prisma.profile.findFirst({
            where: {
                email: newEmail.toLowerCase(),
                id: { not: session.user.id },
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email sudah digunakan" },
                { status: 400 }
            );
        }

        // Update email
        await prisma.profile.update({
            where: { id: session.user.id },
            data: { email: newEmail.toLowerCase() },
        });

        return NextResponse.json({
            success: true,
            message: "Email berhasil diubah. Silakan login kembali dengan email baru.",
        });
    } catch (error) {
        console.error("Change email error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
