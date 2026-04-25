"use client";

import { useSession } from "next-auth/react";
import { Shield } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? "";

  if (!allowedRoles.includes(role)) {
    return fallback ?? (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
        <Shield className="w-10 h-10 mb-3 opacity-40" />
        <p className="font-medium">Access Restricted</p>
        <p className="text-sm mt-1">Your role does not have permission to view this section.</p>
      </div>
    );
  }

  return <>{children}</>;
}
