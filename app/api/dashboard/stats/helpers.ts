import { prisma } from "@/lib/prisma";
import { TicketsBySourceData } from "@/types/dashboard";

export async function getTicketsBySource(): Promise<TicketsBySourceData[]> {
    const sources = ["phone", "email", "web", "walk_in"] as const;
    const sourceColors: Record<string, string> = {
        phone: "#8884d8",
        email: "#82ca9d",
        web: "#ffc658",
        walk_in: "#ff7300",
    };

    const counts = await Promise.all(
        sources.map((source) =>
            prisma.ticket.count({ where: { source } })
        )
    );

    return sources.map((source, index) => ({
        source: source.charAt(0).toUpperCase() + source.slice(1).replace("_", "-"),
        count: counts[index],
        fill: sourceColors[source] || "#8884d8",
    }));
}
