"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Layers, GripVertical } from "lucide-react";
import { getLevelClassName } from "@/lib/ticket-config";

interface SupportLevel {
    id: string;
    code: string;
    name: string;
    description: string | null;
    sortOrder: number;
    canViewAllTickets: boolean;
    canAssignTickets: boolean;
    canEscalateTicket: boolean;
    canCloseTicket: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        profiles: number;
        tickets: number;
    };
}

interface FormData {
    code: string;
    name: string;
    description: string;
    sortOrder: number;
    canViewAllTickets: boolean;
    canAssignTickets: boolean;
    canEscalateTicket: boolean;
    canCloseTicket: boolean;
    isActive: boolean;
}

const defaultForm: FormData = {
    code: "",
    name: "",
    description: "",
    sortOrder: 1,
    canViewAllTickets: false,
    canAssignTickets: false,
    canEscalateTicket: false,
    canCloseTicket: false,
    isActive: true,
};

export default function AdminSupportLevelsPage() {
    const [levels, setLevels] = useState<SupportLevel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState<SupportLevel | null>(null);
    const [form, setForm] = useState<FormData>(defaultForm);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch support levels
    const fetchLevels = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/support-levels");
            const data = await res.json();
            setLevels(data.levels);
        } catch {
            toast.error("Gagal memuat data support level");
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchLevels();
    }, [fetchLevels]);

    // Open dialog for create/edit
    const openDialog = (level: SupportLevel | null = null) => {
        setEditingLevel(level);
        if (level) {
            setForm({
                code: level.code,
                name: level.name,
                description: level.description || "",
                sortOrder: level.sortOrder,
                canViewAllTickets: level.canViewAllTickets,
                canAssignTickets: level.canAssignTickets,
                canEscalateTicket: level.canEscalateTicket,
                canCloseTicket: level.canCloseTicket,
                isActive: level.isActive,
            });
        } else {
            // Get next sort order
            const maxSortOrder = levels.reduce((max, l) => Math.max(max, l.sortOrder), 0);
            setForm({ ...defaultForm, sortOrder: maxSortOrder + 1 });
        }
        setIsDialogOpen(true);
    };

    // Save level (create or update)
    const saveLevel = async () => {
        if (!form.code.trim() || !form.name.trim()) {
            toast.error("Kode dan nama wajib diisi");
            return;
        }

        setIsSaving(true);
        try {
            const method = editingLevel ? "PUT" : "POST";
            const url = editingLevel ? `/api/support-levels/${editingLevel.id}` : "/api/support-levels";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(editingLevel ? "Level diupdate" : "Level dibuat");
                setIsDialogOpen(false);
                void fetchLevels();
            } else {
                toast.error(data.error || "Gagal menyimpan level");
            }
        } catch {
            toast.error("Gagal menyimpan level");
        }
        setIsSaving(false);
    };

    // Delete level
    const deleteLevel = async (level: SupportLevel) => {
        if (level._count && (level._count.profiles > 0 || level._count.tickets > 0)) {
            toast.error(`Level ini masih digunakan oleh ${level._count.profiles} user dan ${level._count.tickets} tiket`);
            return;
        }

        if (!confirm(`Hapus level ${level.code} - ${level.name}?`)) return;

        try {
            const res = await fetch(`/api/support-levels/${level.id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Level dihapus");
                void fetchLevels();
            } else {
                const data = await res.json();
                toast.error(data.error || "Gagal menghapus level");
            }
        } catch {
            toast.error("Gagal menghapus level");
        }
    };

    return (
        <>
            <AdminHeader
                title="Support Level"
                description="Kelola level dukungan untuk agent dan tiket"
            />
            <div className="flex-1 overflow-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5" /> Daftar Support Level
                            <Button size="sm" className="ml-auto" onClick={() => openDialog()}>
                                <Plus className="h-4 w-4 mr-1" /> Tambah
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : levels.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="font-semibold mb-1">Belum ada Support Level</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Buat level pertama untuk mulai mengatur akses agent
                                </p>
                                <Button onClick={() => openDialog()}>
                                    <Plus className="h-4 w-4 mr-1" /> Buat Level
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead className="w-24">Kode</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead className="text-center">Permissions</TableHead>
                                        <TableHead className="text-center">Pengguna</TableHead>
                                        <TableHead className="text-center">Tiket</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="w-24">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {levels.map((level) => (
                                        <TableRow key={level.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <GripVertical className="h-4 w-4" />
                                                    {level.sortOrder}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getLevelClassName(level.code)}>
                                                    {level.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{level.name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                                {level.description || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {level.canViewAllTickets && (
                                                        <Badge variant="outline" className="text-xs">View All</Badge>
                                                    )}
                                                    {level.canAssignTickets && (
                                                        <Badge variant="outline" className="text-xs">Assign</Badge>
                                                    )}
                                                    {level.canEscalateTicket && (
                                                        <Badge variant="outline" className="text-xs">Escalate</Badge>
                                                    )}
                                                    {level.canCloseTicket && (
                                                        <Badge variant="outline" className="text-xs">Close</Badge>
                                                    )}
                                                    {!level.canViewAllTickets && !level.canAssignTickets && !level.canEscalateTicket && !level.canCloseTicket && (
                                                        <span className="text-muted-foreground text-xs">Basic</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">{level._count?.profiles || 0}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">{level._count?.tickets || 0}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {level.isActive ? (
                                                    <Badge variant="default">Aktif</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Nonaktif</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button size="icon-sm" variant="ghost" onClick={() => openDialog(level)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon-sm"
                                                        variant="destructive"
                                                        onClick={() => deleteLevel(level)}
                                                        disabled={(level._count?.profiles || 0) > 0 || (level._count?.tickets || 0) > 0}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialog Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingLevel ? "Edit Support Level" : "Tambah Support Level"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Kode <span className="text-red-500">*</span></Label>
                                <Input
                                    value={form.code}
                                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                    placeholder="L1"
                                    maxLength={10}
                                />
                                <p className="text-xs text-muted-foreground">Kode unik (contoh: L1, L2, L3)</p>
                            </div>
                            <div className="space-y-1">
                                <Label>Urutan</Label>
                                <Input
                                    type="number"
                                    value={form.sortOrder}
                                    onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                                    min={1}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>Nama <span className="text-red-500">*</span></Label>
                            <Input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="Support Agent"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Deskripsi</Label>
                            <Textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Deskripsi level ini..."
                                rows={2}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Permissions</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <p className="text-sm font-medium">View All Tickets</p>
                                        <p className="text-xs text-muted-foreground">Dapat melihat semua tiket</p>
                                    </div>
                                    <Switch
                                        checked={form.canViewAllTickets}
                                        onCheckedChange={v => setForm(f => ({ ...f, canViewAllTickets: v }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <p className="text-sm font-medium">Assign Tickets</p>
                                        <p className="text-xs text-muted-foreground">Dapat assign tiket ke agent</p>
                                    </div>
                                    <Switch
                                        checked={form.canAssignTickets}
                                        onCheckedChange={v => setForm(f => ({ ...f, canAssignTickets: v }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <p className="text-sm font-medium">Escalate Tickets</p>
                                        <p className="text-xs text-muted-foreground">Dapat eskalasi tiket</p>
                                    </div>
                                    <Switch
                                        checked={form.canEscalateTicket}
                                        onCheckedChange={v => setForm(f => ({ ...f, canEscalateTicket: v }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <p className="text-sm font-medium">Close Tickets</p>
                                        <p className="text-xs text-muted-foreground">Dapat menutup tiket</p>
                                    </div>
                                    <Switch
                                        checked={form.canCloseTicket}
                                        onCheckedChange={v => setForm(f => ({ ...f, canCloseTicket: v }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="text-sm font-medium">Status Aktif</p>
                                <p className="text-xs text-muted-foreground">Level dapat digunakan</p>
                            </div>
                            <Switch
                                checked={form.isActive}
                                onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button onClick={saveLevel} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                                Simpan
                            </Button>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                                Batal
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
