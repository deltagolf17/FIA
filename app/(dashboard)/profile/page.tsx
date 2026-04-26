import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { notFound } from "next/navigation";

async function getProfile(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true, name: true, email: true, role: true,
      department: true, badgeNumber: true, certifications: true,
      createdAt: true,
      _count: { select: { investigations: true } },
    },
  });
}

export default async function ProfilePage() {
  const session = await auth();
  const user = await getProfile(session!.user!.email!);
  if (!user) notFound();

  return (
    <div className="flex flex-col h-full">
      <Header title="My Profile" subtitle="Account settings and credentials" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-xl">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
