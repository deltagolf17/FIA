import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { UserManagementClient } from "@/components/admin/UserManagementClient";

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

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="User Management"
        subtitle="Department personnel and access control"
      />

      <div className="flex-1 p-6 overflow-y-auto">
        <RoleGuard allowedRoles={["ADMIN"]}>
          <UserManagementClient users={users} count={users.length} />
        </RoleGuard>
      </div>
    </div>
  );
}
