import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    uploadFile,
    deleteFile,
    generateFileKey,
    validateFile,
    MAX_FILE_SIZE,
} from "@/lib/s3";

// POST /api/upload - Upload file
export async function POST(request: Request) {
    try {
        // Auth check
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check user profile exists
        const profile = await prisma.profile.findUnique({
            where: { id: session.user.id },
        });

        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "attachments";
        const prefix = formData.get("prefix") as string | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file
        const validation = validateFile({
            type: file.type,
            size: file.size,
            name: file.name,
        });

        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Generate key and upload
        const key = generateFileKey(folder, file.name, prefix || undefined);
        const buffer = Buffer.from(await file.arrayBuffer());

        const result = await uploadFile(buffer, key, file.type);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            file: {
                key: result.key,
                url: result.url,
                name: file.name,
                size: file.size,
                type: file.type,
            },
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}

// DELETE /api/upload - Delete file
export async function DELETE(request: Request) {
    try {
        // Auth check
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { key } = await request.json();

        if (!key) {
            return NextResponse.json(
                { error: "No file key provided" },
                { status: 400 }
            );
        }

        const success = await deleteFile(key);

        if (!success) {
            return NextResponse.json(
                { error: "Delete failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "Delete failed" },
            { status: 500 }
        );
    }
}

// GET /api/upload - Get upload config (max size, allowed types)
export async function GET() {
    return NextResponse.json({
        maxSize: MAX_FILE_SIZE,
        maxSizeMB: MAX_FILE_SIZE / 1024 / 1024,
        allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"],
        allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp", "pdf"],
    });
}
