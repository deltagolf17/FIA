import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { formatDate } from "@/lib/utils/formatters";
import { Users, Shield, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true,
      department: true, badgeNumber: true, isActive: true, createdAt: true,
      _count: { select: { investigations: true } },
    },
  });
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN:             "bg-purple-100 text-purple-800",
  SUPERVISOR:        "bg-authority-100 text-authority-800",
  INVESTIGATOR:      "bg-blue-100 text-blue-800",
  FIREFIGHTER:       "bg-fire-100 text-fire-800",
  INSURANCE_ADJUSTER:"bg-green-100 text-green-800",
};

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="flex flex-col h-full">
      <Header title="User Management" subtitle="Department personnel and access control" />

      <div className="flex-1 p-6 overflow-y-auto">
        <RoleGuard allowedRoles={["ADMIN"]}>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4" />
                <span className="font-medium">{users.length} users</span>
              </div>
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
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}
