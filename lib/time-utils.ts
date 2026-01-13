// Time utilities for ticket display

export function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = [
        { label: "tahun", seconds: 31536000 },
        { label: "bulan", seconds: 2592000 },
        { label: "minggu", seconds: 604800 },
        { label: "hari", seconds: 86400 },
        { label: "jam", seconds: 3600 },
        { label: "menit", seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label} lalu`;
        }
    }

    return "Baru saja";
}

export function isUrgent(dateString: string, hoursThreshold = 24): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const hours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return hours > hoursThreshold;
}

export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}
