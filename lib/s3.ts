import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 Configuration
const s3Config = {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "auto",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
};

// Create S3 client (compatible with AWS S3, R2, MinIO, etc.)
const s3Client = new S3Client(s3Config);

const BUCKET = process.env.S3_BUCKET || "ticket-attachments";
const PUBLIC_URL = process.env.S3_PUBLIC_URL; // Optional: for public access

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
    return !!(
        process.env.S3_ENDPOINT &&
        process.env.S3_ACCESS_KEY_ID &&
        process.env.S3_SECRET_ACCESS_KEY &&
        process.env.S3_BUCKET
    );
}

/**
 * Get fresh file URL (regenerates presigned URL or returns public URL)
 */
export async function getFreshFileUrl(fileKey: string): Promise<string> {
    if (PUBLIC_URL) {
        return `${PUBLIC_URL}/${fileKey}`;
    }
    return await getPresignedUrl(fileKey, 3600); // 1 hour expiry
}

// File constraints
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const ALLOWED_TYPES = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    // Documents
    "application/pdf",
    // Word documents
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx"];

/**
 * Validate file type and size
 */
export function validateFile(file: { type: string; size: number; name: string }): {
    valid: boolean;
    error?: string;
} {
    // Check size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File terlalu besar. Maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        };
    }

    // Check type
    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: "Format file tidak didukung. Gunakan PDF atau gambar (JPG, PNG, WEBP)",
        };
    }

    // Check extension
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return {
            valid: false,
            error: "Ekstensi file tidak valid",
        };
    }

    return { valid: true };
}

/**
 * Generate unique file key with folder structure
 */
export function generateFileKey(
    folder: string,
    fileName: string,
    prefix?: string
): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const safeName = fileName
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .substring(0, 50);

    const key = prefix
        ? `${folder}/${prefix}/${timestamp}-${random}-${safeName}`
        : `${folder}/${timestamp}-${random}-${safeName}`;

    return key;
}

/**
 * Upload file to S3
 */
export async function uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string
): Promise<{ success: boolean; key?: string; url?: string; error?: string }> {
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });

        await s3Client.send(command);

        // Generate URL
        const url = PUBLIC_URL
            ? `${PUBLIC_URL}/${key}`
            : await getPresignedUrl(key, 3600 * 24 * 7); // 7 days

        return { success: true, key, url };
    } catch (error) {
        console.error("S3 upload error:", error);
        return {
            success: false,
            error: "Gagal upload file",
        };
    }
}

/**
 * Delete file from S3
 */
export async function deleteFile(key: string): Promise<boolean> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key,
        });

        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error("S3 delete error:", error);
        return false;
    }
}

/**
 * Get presigned URL for file access
 */
export async function getPresignedUrl(
    key: string,
    expiresIn: number = 3600 // 1 hour default
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get public URL for file (if S3_PUBLIC_URL is set)
 */
export function getPublicUrl(key: string): string | null {
    if (!PUBLIC_URL) return null;
    return `${PUBLIC_URL}/${key}`;
}

/**
 * List files in S3 bucket with optional prefix filter
 */
export async function listFiles(
    prefix?: string,
    maxKeys: number = 1000
): Promise<{
    files: Array<{ key: string; size: number; lastModified: Date }>;
    error?: string;
}> {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: prefix,
            MaxKeys: maxKeys,
        });

        const response = await s3Client.send(command);

        const files =
            response.Contents?.map((item) => ({
                key: item.Key || "",
                size: item.Size || 0,
                lastModified: item.LastModified || new Date(),
            })) || [];

        return { files };
    } catch (error) {
        console.error("S3 list error:", error);
        return { files: [], error: "Gagal mengambil daftar file" };
    }
}

/**
 * Get file info/metadata from S3
 */
export async function getFileInfo(key: string): Promise<{
    exists: boolean;
    size?: number;
    contentType?: string;
    lastModified?: Date;
    error?: string;
}> {
    try {
        const command = new HeadObjectCommand({
            Bucket: BUCKET,
            Key: key,
        });

        const response = await s3Client.send(command);

        return {
            exists: true,
            size: response.ContentLength,
            contentType: response.ContentType,
            lastModified: response.LastModified,
        };
    } catch (error: unknown) {
        if (
            error &&
            typeof error === "object" &&
            "name" in error &&
            error.name === "NotFound"
        ) {
            return { exists: false };
        }
        console.error("S3 head error:", error);
        return { exists: false, error: "Gagal mengambil info file" };
    }
}
