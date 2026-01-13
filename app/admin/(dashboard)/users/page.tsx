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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Users, ShieldCheck } from "lucide-react";
import { getLevelClassName } from "@/lib/ticket-config";

interface SupportLevel {
  id: string;
  code: string;
  name: string;
}

type User = {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  role: "admin" | "agent";
  level: SupportLevel | null;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "agent", label: "Agent" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [levels, setLevels] = useState<SupportLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    email: "",
    username: "",
    fullName: "",
    role: "agent",
    levelId: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users);
    } catch {
      toast.error("Gagal memuat data pengguna");
    }
    setIsLoading(false);
  }, []);

  // Fetch support levels
  const fetchLevels = useCallback(async () => {
    try {
      const res = await fetch("/api/support-levels");
      const data = await res.json();
      setLevels(data.levels);
    } catch {
      console.error("Failed to fetch levels");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open dialog for create/edit
  const openDialog = (user: User | null = null) => {
    setEditingUser(user);
    // Get default levelId (first level if available)
    const defaultLevelId = levels.length > 0 ? levels[0].id : "";

    setForm(
      user
        ? {
          email: user.email,
          username: user.username || "",
          fullName: user.fullName || "",
          role: user.role,
          levelId: user.level?.id || defaultLevelId,
        }
        : {
          email: "",
          username: "",
          fullName: "",
          role: "agent",
          levelId: defaultLevelId,
        }
    );
    setIsDialogOpen(true);
  };

  // Save user (create or update)
  const saveUser = async () => {
    setIsSaving(true);
    try {
      const method = editingUser ? "PUT" : "POST";
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editingUser ? "User diupdate" : `User dibuat. Password: ${data.tempPassword || "-"}`);
        setIsDialogOpen(false);
        void fetchUsers();
      } else {
        toast.error(data.error || "Gagal menyimpan user");
      }
    } catch {
      toast.error("Gagal menyimpan user");
    }
    setIsSaving(false);
  };

  // Soft delete user
  const deleteUser = async (user: User) => {
    if (!confirm(`Hapus user ${user.email}?`)) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User dihapus (soft delete)");
        void fetchUsers();
      } else {
        toast.error("Gagal menghapus user");
      }
    } catch {
      toast.error("Gagal menghapus user");
    }
  };

  return (
    <>
      <AdminHeader title="Manajemen Pengguna" description="Kelola admin dan agent sistem" />
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Daftar Pengguna
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
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.level ? (
                          <Badge className={getLevelClassName(user.level.code)}>
                            {user.level.code}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge variant="default">Aktif</Badge>
                        ) : (
                          <Badge variant="destructive">Nonaktif</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="icon-sm" variant="ghost" onClick={() => openDialog(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon-sm" variant="destructive" onClick={() => deleteUser(user)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit Pengguna" : "Tambah Pengguna"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Username</Label>
              <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Nama Lengkap</Label>
              <Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Support Level</Label>
              <Select value={form.levelId} onValueChange={v => setForm(f => ({ ...f, levelId: v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih level" /></SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.code} - {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={saveUser} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Simpan
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Batal</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

