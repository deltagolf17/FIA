import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/types";

export const authConfig = {
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id as string;
        token.role = (user as { role?: string }).role as string;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id   = token.id as string;
      session.user.role = token.role as UserRole;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
