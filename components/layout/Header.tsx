"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {action && action}

        <Link href="/investigations/new">
          <Button size="sm" variant="fire" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New Investigation
          </Button>
        </Link>

        <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Notifications">
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
