"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, Flame, FileSearch, BarChart3,
  Shield, Users, Settings, Building2, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["FIREFIGHTER", "INVESTIGATOR", "SUPERVISOR", "INSURANCE_ADJUSTER", "ADMIN"],
  },
  {
    label: "Investigations",
    href: "/investigations",
    icon: Flame,
    roles: ["FIREFIGHTER", "INVESTIGATOR", "SUPERVISOR", "ADMIN"],
  },
  {
    label: "Evidence",
    href: "/investigations",
    icon: FileSearch,
    roles: ["INVESTIGATOR", "SUPERVISOR", "ADMIN"],
    sub: true,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["INVESTIGATOR", "SUPERVISOR", "ADMIN"],
  },
  {
    label: "Insurance",
    href: "/insurance",
    icon: Building2,
    roles: ["INSURANCE_ADJUSTER", "SUPERVISOR", "ADMIN"],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? "FIREFIGHTER";

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 min-h-screen bg-authority-900 text-white flex flex-col sidebar-glow">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-authority-700">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-fire flex items-center justify-center shadow-lg">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">FireTrace Pro</p>
            <p className="text-authority-300 text-xs mt-0.5">NFPA 921 Compliant</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-fire-600 text-white shadow-sm"
                  : "text-authority-300 hover:bg-authority-800 hover:text-white",
                item.sub && "ml-4 text-xs"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-white" : "text-authority-400 group-hover:text-white")} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-authority-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-fire-600 flex items-center justify-center text-xs font-bold text-white uppercase">
            {session?.user?.name?.charAt(0) ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name ?? "User"}</p>
            <p className="text-xs text-authority-400 truncate capitalize">
              {role.toLowerCase().replace("_", " ")}
            </p>
          </div>
          <Shield className="w-4 h-4 text-authority-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
