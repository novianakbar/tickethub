"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { signOut } from "next-auth/react";

interface ProfileData {
    id: string;
    email: string;
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    role: string;
    createdAt: string;
    level: {
        code: string;
        name: string;
    };
}

export function AccountSettings() {
    const { user } = useAuth();
    const [isFetching, setIsFetching] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);

    // Profile form state
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");

    // Email form state
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");
    const [showEmailPassword, setShowEmailPassword] = useState(false);

    // Password form state
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("/api/users/me/profile");
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data.profile);
                    setFullName(data.profile.fullName || "");
                    setUsername(data.profile.username || "");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Gagal mengambil data profil");
            } finally {
                setIsFetching(false);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdateProfile = async () => {
        setIsUpdatingProfile(true);
        try {
            const response = await fetch("/api/users/me/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, username: username || undefined }),
            });

            const data = await response.json();
            if (response.ok) {
                setProfile(data.profile);
                toast.success("Profil berhasil diperbarui");
            } else {
                toast.error(data.error || "Gagal memperbarui profil");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Gagal memperbarui profil");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleChangeEmail = async () => {
        if (!newEmail || !emailPassword) {
            toast.error("Email baru dan password harus diisi");
            return;
        }

        setIsUpdatingEmail(true);
        try {
            const response = await fetch("/api/users/me/email", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newEmail, currentPassword: emailPassword }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success(data.message);
                // Clear form
                setNewEmail("");
                setEmailPassword("");
                // Logout to refresh session
                setTimeout(() => {
                    signOut({ callbackUrl: "/admin/login" });
                }, 2000);
            } else {
                toast.error(data.error || "Gagal mengubah email");
            }
        } catch (error) {
            console.error("Error changing email:", error);
            toast.error("Gagal mengubah email");
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Semua field password harus diisi");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Password baru dan konfirmasi tidak cocok");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const response = await fetch("/api/users/me/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success(data.message);
                // Clear form
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                // Logout to refresh session
                setTimeout(() => {
                    signOut({ callbackUrl: "/admin/login" });
                }, 2000);
            } else {
                toast.error(data.error || "Gagal mengubah password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error("Gagal mengubah password");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (isFetching) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Section - Full width */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informasi Profil
                    </CardTitle>
                    <CardDescription>
                        Perbarui informasi profil Anda
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={profile?.email || ""}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Untuk mengubah email, gunakan form di bawah
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                value={`${user?.role === "admin" ? "Administrator" : "Agent"} - ${profile?.level?.name || ""}`}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nama Lengkap</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Masukkan nama lengkap"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Masukkan username"
                            />
                            <p className="text-xs text-muted-foreground">
                                Hanya huruf, angka, dan underscore
                            </p>
                        </div>
                    </div>

                    <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Profil"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Email and Password sections side by side on larger screens */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Change Email Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Ubah Email
                        </CardTitle>
                        <CardDescription>
                            Ubah alamat email yang digunakan untuk login
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newEmail">Email Baru</Label>
                                <Input
                                    id="newEmail"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="Masukkan email baru"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emailPassword">Password Saat Ini</Label>
                                <div className="relative">
                                    <Input
                                        id="emailPassword"
                                        type={showEmailPassword ? "text" : "password"}
                                        value={emailPassword}
                                        onChange={(e) => setEmailPassword(e.target.value)}
                                        placeholder="Masukkan password"
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowEmailPassword(!showEmailPassword)}
                                    >
                                        {showEmailPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                ⚠️ Setelah mengubah email, Anda akan logout dan perlu login kembali dengan email baru.
                            </p>
                        </div>

                        <Button onClick={handleChangeEmail} disabled={isUpdatingEmail}>
                            {isUpdatingEmail ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mengubah...
                                </>
                            ) : (
                                "Ubah Email"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Change Password Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Ubah Password
                        </CardTitle>
                        <CardDescription>
                            Perbarui password akun Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Masukkan password saat ini"
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Password Baru</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Masukkan password baru"
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Minimal 8 karakter
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Ulangi password baru"
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                ⚠️ Setelah mengubah password, Anda akan logout dan perlu login kembali.
                            </p>
                        </div>

                        <Button onClick={handleChangePassword} disabled={isUpdatingPassword}>
                            {isUpdatingPassword ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mengubah...
                                </>
                            ) : (
                                "Ubah Password"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
