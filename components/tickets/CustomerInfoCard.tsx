"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Mail,
    Phone,
    Building,
    Copy,
    ExternalLink,
    Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CustomerInfoCardProps {
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    customerCompany: string | null;
    ticketCount?: number;
    className?: string;
}

export function CustomerInfoCard({
    customerName,
    customerEmail,
    customerPhone,
    customerCompany,
    ticketCount,
    className,
}: CustomerInfoCardProps) {
    const handleCopyEmail = () => {
        navigator.clipboard.writeText(customerEmail);
        toast.success("Email disalin");
    };

    const handleCopyPhone = () => {
        if (customerPhone) {
            navigator.clipboard.writeText(customerPhone);
            toast.success("Nomor telepon disalin");
        }
    };

    // Get initials for avatar
    const initials = customerName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Informasi Pelanggan
                    </CardTitle>
                    {ticketCount !== undefined && ticketCount > 1 && (
                        <Badge variant="secondary" className="text-xs">
                            <Ticket className="h-3 w-3 mr-1" />
                            {ticketCount} tiket
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Customer Identity */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-semibold">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{customerName}</h3>
                        {customerCompany && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                                <Building className="h-3 w-3 shrink-0" />
                                {customerCompany}
                            </p>
                        )}
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                    {/* Email */}
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 group">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a
                            href={`mailto:${customerEmail}`}
                            className="text-sm flex-1 truncate hover:text-primary transition-colors"
                        >
                            {customerEmail}
                        </a>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={handleCopyEmail}
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                asChild
                            >
                                <a href={`mailto:${customerEmail}`}>
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Phone */}
                    {customerPhone && (
                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 group">
                            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                            <a
                                href={`tel:${customerPhone}`}
                                className="text-sm flex-1 truncate hover:text-primary transition-colors"
                            >
                                {customerPhone}
                            </a>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={handleCopyPhone}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    asChild
                                >
                                    <a href={`tel:${customerPhone}`}>
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
