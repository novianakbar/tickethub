import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/me/preferences - Get current user's notification preferences
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
        fullName: true,
        notifyOnAssigned: true,
        notifyOnCustomerReply: true,
        notifySlaWarning: true,
        notifyTicketProgress: true,
        notifyOnUnassigned: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      preferences: {
        notifyOnAssigned: profile.notifyOnAssigned,
        notifyOnCustomerReply: profile.notifyOnCustomerReply,
        notifySlaWarning: profile.notifySlaWarning,
        notifyTicketProgress: profile.notifyTicketProgress,
        notifyOnUnassigned: profile.notifyOnUnassigned,
      },
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/me/preferences - Update current user's notification preferences
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate and extract only allowed fields
    const allowedFields = [
      "notifyOnAssigned",
      "notifyOnCustomerReply",
      "notifySlaWarning",
      "notifyTicketProgress",
      "notifyOnUnassigned",
    ];

    const updates: Record<string, boolean> = {};

    for (const field of allowedFields) {
      if (typeof body[field] === "boolean") {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const profile = await prisma.profile.update({
      where: { id: session.user.id },
      data: updates,
      select: {
        notifyOnAssigned: true,
        notifyOnCustomerReply: true,
        notifySlaWarning: true,
        notifyTicketProgress: true,
        notifyOnUnassigned: true,
      },
    });

    return NextResponse.json({
      preferences: profile,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
