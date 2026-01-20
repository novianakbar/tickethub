"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { TableCard } from "@/components/ui/table-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { toast } from "sonner";
import { Pencil, Trash2, Users, ShieldCheck, Plus, KeyRound } from "lucide-react";
import { getLevelClassName } from "@/lib/ticket-config";

interface SupportLevel {
  id: string;
  code: string;
  name: string;
}

interface User {
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
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Reset password dialog state
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Fetch users with pagination
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", pagination.page.toString());
        params.set("limit", pagination.limit.toString());

        const res = await fetch(`/api/users?${params.toString()}`);
        const data = await res.json();

        setUsers(data.users || []);
        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages,
          }));
        } else {
          // Fallback jika API belum support pagination
          setPagination((prev) => ({
            ...prev,
            total: data.users?.length || 0,
            totalPages: 1,
          }));
        }
      } catch {
        toast.error("Gagal memuat data pengguna");
      }
      setIsLoading(false);
    };

    void fetchUsers();
  }, [pagination.page, pagination.limit, refetchTrigger]);

  // Fetch support levels
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await fetch("/api/support-levels");
        const data = await res.json();
        setLevels(data.levels || []);
      } catch {
        console.error("Failed to fetch levels");
      }
    };

    void fetchLevels();
  }, []);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  // Open dialog for create/edit
  const openDialog = (user: User | null = null) => {
    setEditingUser(user);
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
        toast.success(editingUser ? "User berhasil diupdate" : "User berhasil dibuat. Informasi login telah dikirim ke email.");
        setIsDialogOpen(false);
        setRefetchTrigger((prev) => prev + 1);
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
        setRefetchTrigger((prev) => prev + 1);
      } else {
        toast.error("Gagal menghapus user");
      }
    } catch {
      toast.error("Gagal menghapus user");
    }
  };

  // Open reset password dialog
  const openResetDialog = (user: User) => {
    setUserToReset(user);
    setIsResetDialogOpen(true);
  };

  // Reset password
  const resetPassword = async () => {
    if (!userToReset) return;
    setIsResetting(true);
    try {
      const res = await fetch(`/api/users/${userToReset.id}/reset-password`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password berhasil direset. Password baru telah dikirim ke email user.");
        setIsResetDialogOpen(false);
        setUserToReset(null);
      } else {
        toast.error(data.error || "Gagal mereset password");
      }
    } catch {
      toast.error("Gagal mereset password");
    }
    setIsResetting(false);
  };

  return (
    <div className="flex-1 p-6">
      <PageHeader title="Manajemen Pengguna" description="Kelola admin dan agent sistem" />
      <TableCard
        title="Daftar Pengguna"
        description="Admin dan agent yang terdaftar dalam sistem"
        icon={Users}
        isLoading={isLoading}
        isEmpty={users.length === 0}
        emptyState={{
          icon: Users,
          title: "Belum ada pengguna",
          description: "Tambahkan pengguna untuk memulai mengelola sistem.",
          action: (
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-1" /> Tambah Pengguna
            </Button>
          ),
        }}
        action={
          <Button size="sm" onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-1" /> Tambah
          </Button>
        }
        footer={
          pagination.totalPages > 0 && (
            <DataTablePagination
              pageIndex={pagination.page}
              pageSize={pagination.limit}
              rowCount={pagination.total}
              pageCount={pagination.totalPages}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">Level</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {(pagination.page - 1) * pagination.limit + index + 1}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username || "-"}</TableCell>
                <TableCell>{user.fullName || "-"}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {user.level ? (
                    <Badge className={getLevelClassName(user.level.code)}>
                      {user.level.code}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {user.isActive ? (
                    <Badge variant="default">Aktif</Badge>
                  ) : (
                    <Badge variant="destructive">Nonaktif</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openDialog(user)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => openResetDialog(user)} title="Reset Password">
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button size="icon-sm" variant="destructive" onClick={() => deleteUser(user)} title="Hapus">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableCard>

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
                <ShieldCheck className="h-4 w-4 mr-1" /> Simpan
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Batal</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Reset Password */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-orange-500" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Anda akan mereset password untuk user berikut:
            </DialogDescription>
          </DialogHeader>
          {userToReset && (
            <div className="py-4">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{userToReset.email}</span>
                </div>
                {userToReset.fullName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nama:</span>
                    <span className="font-medium">{userToReset.fullName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant={userToReset.role === "admin" ? "default" : "secondary"}>
                    {userToReset.role}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Password baru akan di-generate secara otomatis dan dikirim ke email user.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)} disabled={isResetting}>
              Batal
            </Button>
            <Button onClick={resetPassword} disabled={isResetting}>
              <KeyRound className="h-4 w-4 mr-1" />
              {isResetting ? "Mereset..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
