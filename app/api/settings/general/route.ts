import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Default settings yang akan digunakan jika belum ada di database
const DEFAULT_SETTINGS: Record<string, string> = {
  siteName: "TicketHub",
  supportEmail: "support@example.com",
  companyName: "TicketHub Inc.",
  autoCloseDays: "7",
  emailCustomerEnabled: "true",
};

// GET /api/settings/general - Get all general settings
export async function GET() {
  try {
    const settings = await prisma.appSettings.findMany();

    // Merge dengan default settings
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching general settings:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan" },
      { status: 500 }
    );
  }
}

// PUT /api/settings/general - Update general settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validasi keys yang diperbolehkan
    const allowedKeys = Object.keys(DEFAULT_SETTINGS);
    const updates: { key: string; value: string }[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (allowedKeys.includes(key) && typeof value === "string") {
        updates.push({ key, value });
      }
    }

    // Upsert setiap setting
    for (const { key, value } of updates) {
      await prisma.appSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    // Fetch updated settings
    const settings = await prisma.appSettings.findMany();
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating general settings:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}
