"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateUserModal } from "./CreateUserModal";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/formatters";

const ROLE_COLORS: Record<string, string> = {
  ADMIN:             "bg-purple-100 text-purple-800",
  SUPERVISOR:        "bg-blue-100 text-blue-800",
  INVESTIGATOR:      "bg-authority-100 text-authority-800",
  FIREFIGHTER:       "bg-fire-100 text-fire-800",
  INSURANCE_ADJUSTER:"bg-green-100 text-green-800",
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  badgeNumber: string | null;
  isActive: boolean;
  createdAt: Date | string;
  _count: { investigations: number };
}

interface Props {
  users: User[];
  count: number;
}

export function UserManagementClient({ users, count }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  async function toggleActive(userId: string, current: boolean) {
    setToggling(userId);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, isActive: !current }),
      });
      router.refresh();
    } finally {
      setToggling(null);
    }
  }

  return (
    <>
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">{count} users</span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="bg-authority-700 hover:bg-authority-800 gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cases</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-authority-100 rounded-full flex items-center justify-center text-xs font-bold text-authority-700 uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-xs font-medium px-2 py-1 rounded-full", ROLE_COLORS[user.role] ?? "bg-slate-100 text-slate-600")}>
                    {user.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">{user.department ?? "—"}</td>
                <td className="px-4 py-3 text-slate-700 font-medium">{user._count.investigations}</td>
                <td className="px-4 py-3">
                  {user.isActive ? (
                    <div className="flex items-center gap-1 text-green-700 text-xs">
                      <CheckCircle className="w-3.5 h-3.5" />Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 text-xs">
                      <XCircle className="w-3.5 h-3.5" />Inactive
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(user.createdAt as string)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(user.id, user.isActive)}
                    disabled={toggling === user.id}
                    className={cn(
                      "text-xs px-2 py-1 rounded-md transition-colors",
                      user.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    )}
                  >
                    {toggling === user.id ? "…" : user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
