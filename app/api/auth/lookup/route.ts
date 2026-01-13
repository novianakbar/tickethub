import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Search customers by email (for autocomplete)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const email = searchParams.get("email");

        if (!email || email.length < 3) {
            return NextResponse.json({ customers: [] });
        }

        // Search customers (people who have created tickets)
        const tickets = await prisma.ticket.findMany({
            where: {
                customerEmail: {
                    contains: email,
                    mode: "insensitive",
                },
            },
            select: {
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                customerCompany: true,
            },
            distinct: ["customerEmail"],
            take: 5,
        });

        // Get ticket count for each customer
        const customers = await Promise.all(
            tickets.map(async (ticket) => {
                const ticketCount = await prisma.ticket.count({
                    where: { customerEmail: ticket.customerEmail },
                });
                return {
                    name: ticket.customerName,
                    email: ticket.customerEmail,
                    phone: ticket.customerPhone,
                    company: ticket.customerCompany,
                    ticketCount,
                };
            })
        );

        return NextResponse.json({ customers });
    } catch (error) {
        console.error("Customer search error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { identifier } = await request.json();

        if (!identifier) {
            return NextResponse.json(
                { error: "Identifier required" },
                { status: 400 }
            );
        }

        // Check if it's already an email
        if (identifier.includes("@")) {
            return NextResponse.json({ email: identifier });
        }

        // Look up by username
        const profile = await prisma.profile.findFirst({
            where: { username: identifier },
            select: { email: true },
        });

        if (!profile) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ email: profile.email });
    } catch (error) {
        console.error("Lookup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
