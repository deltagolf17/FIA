"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard, Flame, BarChart3,
  Shield, Users, Settings, Building2, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { label: "Dashboard",    href: "/",              icon: LayoutDashboard, roles: ["FIREFIGHTER","INVESTIGATOR","SUPERVISOR","INSURANCE_ADJUSTER","ADMIN"] },
  { label: "Investigations",href: "/investigations", icon: Flame,           roles: ["FIREFIGHTER","INVESTIGATOR","SUPERVISOR","ADMIN"] },
  { label: "Analytics",    href: "/analytics",      icon: BarChart3,        roles: ["INVESTIGATOR","SUPERVISOR","ADMIN"] },
  { label: "Insurance",    href: "/insurance",      icon: Building2,        roles: ["INSURANCE_ADJUSTER","SUPERVISOR","ADMIN"] },
  { label: "Users",        href: "/admin/users",    icon: Users,            roles: ["ADMIN"] },
  { label: "Settings",     href: "/admin/settings", icon: Settings,         roles: ["ADMIN"] },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? "FIREFIGHTER";
  const visible = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-authority-700 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-9 h-9 rounded-lg gradient-fire flex items-center justify-center shadow-lg shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none text-white">FireTrace Pro</p>
            <p className="text-authority-300 text-xs mt-0.5">NFPA 921 Compliant</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-authority-400 hover:text-white transition-colors lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visible.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-fire-600 text-white shadow-sm"
                  : "text-authority-300 hover:bg-authority-800 hover:text-white"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 shrink-0",
                active ? "text-white" : "text-authority-400 group-hover:text-white"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-authority-700">
        <Link href="/profile" onClick={onClose} className="flex items-center gap-3 rounded-lg hover:bg-authority-800 px-1 py-1.5 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-fire-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
            {session?.user?.name?.charAt(0) ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name ?? "User"}</p>
            <p className="text-xs text-authority-400 truncate capitalize">
              {role.toLowerCase().replace("_", " ")}
            </p>
          </div>
          <Shield className="w-4 h-4 text-authority-400 shrink-0 group-hover:text-white transition-colors" />
        </Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-9 h-9 bg-authority-900 text-white rounded-lg flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-authority-900 z-50 transition-transform duration-300 shadow-2xl",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <NavContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-authority-900 text-white flex-col shrink-0" style={{ boxShadow: "4px 0 24px rgba(30,58,138,0.08)" }}>
        <NavContent />
      </aside>
    </>
  );
}
