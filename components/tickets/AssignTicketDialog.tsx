"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Check, ChevronsUpDown, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
    id: string;
    fullName: string | null;
    email: string;
    role?: string;
    level?: {
        id: string;
        code: string;
        name: string;
    } | null;
}

interface AssignTicketDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agents: Agent[];
    currentAssigneeId?: string | null;
    onAssign: (assigneeId: string | null, note?: string) => Promise<boolean>;
}

export function AssignTicketDialog({
    open,
    onOpenChange,
    agents,
    currentAssigneeId,
    onAssign,
}: AssignTicketDialogProps) {
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(
        currentAssigneeId || null
    );
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comboboxOpen, setComboboxOpen] = useState(false);

    // Reset state when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setSelectedAgentId(currentAssigneeId || null);
            setNote("");
            setComboboxOpen(false);
        }
        onOpenChange(newOpen);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const success = await onAssign(selectedAgentId, note.trim() || undefined);
            if (success) {
                onOpenChange(false);
                setNote("");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedAgent = agents.find((a) => a.id === selectedAgentId);
    const isChanged = selectedAgentId !== (currentAssigneeId || null);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Tugaskan Tiket
                    </DialogTitle>
                    <DialogDescription>
                        Pilih agen untuk menangani tiket ini. Agen yang dipilih akan menerima
                        notifikasi email.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Agent Selection - Combobox/Autocomplete */}
                    <div className="space-y-2">
                        <Label>Agen</Label>
                        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={comboboxOpen}
                                    className="w-full justify-between font-normal"
                                >
                                    {selectedAgent ? (
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="truncate">
                                                {selectedAgent.fullName || selectedAgent.email}
                                            </span>
                                            {selectedAgent.level && (
                                                <Badge variant="outline" className="text-xs shrink-0">
                                                    {selectedAgent.level.code}
                                                </Badge>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            Pilih agen...
                                        </span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Cari nama atau email..." />
                                    <CommandList>
                                        <CommandEmpty>Tidak ada agen ditemukan.</CommandEmpty>
                                        <CommandGroup>
                                            {/* Unassigned option */}
                                            <CommandItem
                                                value="__unassigned__"
                                                onSelect={() => {
                                                    setSelectedAgentId(null);
                                                    setComboboxOpen(false);
                                                }}
                                            >
                                                <UserX className="mr-2 h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Belum ditugaskan</span>
                                                <Check
                                                    className={cn(
                                                        "ml-auto h-4 w-4",
                                                        !selectedAgentId ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                            
                                            {/* Agent list */}
                                            {agents.map((agent) => (
                                                <CommandItem
                                                    key={agent.id}
                                                    value={`${agent.fullName || ""} ${agent.email} ${agent.level?.code || ""}`}
                                                    onSelect={() => {
                                                        setSelectedAgentId(agent.id);
                                                        setComboboxOpen(false);
                                                    }}
                                                >
                                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium truncate">
                                                                {agent.fullName || agent.email}
                                                            </span>
                                                            {agent.level && (
                                                                <Badge variant="outline" className="text-xs shrink-0">
                                                                    {agent.level.code}
                                                                </Badge>
                                                            )}
                                                            {agent.role === "admin" && (
                                                                <Badge variant="secondary" className="text-xs shrink-0">
                                                                    Admin
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {agent.fullName && (
                                                            <span className="text-xs text-muted-foreground truncate">
                                                                {agent.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Check
                                                        className={cn(
                                                            "ml-auto h-4 w-4 shrink-0",
                                                            selectedAgentId === agent.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        
                        {selectedAgent && (
                            <p className="text-xs text-muted-foreground">
                                {selectedAgent.email}
                                {selectedAgent.level && ` • ${selectedAgent.level.name}`}
                            </p>
                        )}
                    </div>

                    {/* Note Field */}
                    <div className="space-y-2">
                        <Label htmlFor="note">Catatan (opsional)</Label>
                        <Textarea
                            id="note"
                            placeholder="Tambahkan catatan untuk penugasan ini..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Catatan akan dicatat di riwayat aktivitas tiket.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isChanged}
                    >
                        {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {!selectedAgentId
                            ? "Hapus Penugasan"
                            : "Tugaskan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
