import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// SupportLevel type for session
export interface SessionSupportLevel {
  id: string;
  code: string;
  name: string;
  canViewOwnTickets: boolean;
  canViewTeamTickets: boolean;
  canViewAllTickets: boolean;
  canCreateTicket: boolean;
  canAssignTicket: boolean;
  canEscalateTicket: boolean;
  canResolveTicket: boolean;
  canCloseTicket: boolean;
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      level: SessionSupportLevel;
      username?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    level: SessionSupportLevel;
    username?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: UserRole;
    level: SessionSupportLevel;
    username?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi");
        }

        // Find user by email with level relation
        const user = await prisma.profile.findUnique({
          where: { email: credentials.email },
          include: { level: true },
        });

        if (!user) {
          throw new Error("Email atau password salah");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          throw new Error("Email atau password salah");
        }

        // Return user object with level
        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          level: {
            id: user.level.id,
            code: user.level.code,
            name: user.level.name,
            canViewOwnTickets: user.level.canViewOwnTickets,
            canViewTeamTickets: user.level.canViewTeamTickets,
            canViewAllTickets: user.level.canViewAllTickets,
            canCreateTicket: user.level.canCreateTicket,
            canAssignTicket: user.level.canAssignTicket,
            canEscalateTicket: user.level.canEscalateTicket,
            canResolveTicket: user.level.canResolveTicket,
            canCloseTicket: user.level.canCloseTicket,
          },
          username: user.username,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.level = user.level;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.level = token.level;
        session.user.username = token.username;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

