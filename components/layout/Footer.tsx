export function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container py-6">
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                            <svg
                                className="h-3.5 w-3.5 text-primary-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                />
                            </svg>
                        </div>
                        <span className="text-sm font-medium">TicketHub</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Sistem Pelacakan Tiket
                    </p>
                </div>
            </div>
        </footer>
    );
}
