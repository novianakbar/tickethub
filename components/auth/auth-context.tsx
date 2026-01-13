"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { SessionProvider, useSession, signOut as nextAuthSignOut } from "next-auth/react";
import type { Profile } from "@prisma/client";
import type { SessionSupportLevel } from "@/lib/auth";

type UserRole = "admin" | "agent";

interface AuthUser {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    level: SessionSupportLevel;
    username?: string | null;
}

interface AuthContextType {
    user: AuthUser | null;
    profile: Profile | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    isAgent: boolean;
    level: SessionSupportLevel | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthContextProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const isLoading = status === "loading" || profileLoading;

    // Fetch full profile via API route (using Prisma)
    const fetchProfile = useCallback(async () => {
        setProfileLoading(true);
        try {
            const res = await fetch("/api/auth/profile");
            if (res.ok) {
                const { profile } = await res.json();
                setProfile(profile);
            } else {
                setProfile(null);
            }
        } catch {
            setProfile(null);
        } finally {
            setProfileLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session?.user) {
            fetchProfile();
        } else {
            setProfile(null);
        }
    }, [session, fetchProfile]);

    const signOut = async () => {
        await nextAuthSignOut({ callbackUrl: "/admin/login" });
        setProfile(null);
    };

    // Convert session user to AuthUser
    const user: AuthUser | null = session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role as UserRole,
            level: session.user.level,
            username: session.user.username,
        }
        : null;

    const value: AuthContextType = {
        user,
        profile,
        isLoading,
        signOut,
        isAdmin: user?.role === "admin",
        isAgent: user?.role === "agent",
        level: user?.level ?? null,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <AuthContextProvider>{children}</AuthContextProvider>
        </SessionProvider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

