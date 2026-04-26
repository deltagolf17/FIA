import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { OfflineBanner } from "@/components/layout/OfflineBanner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/landing");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <OfflineBanner />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top padding so hamburger doesn't overlap content */}
        <main className="flex-1 overflow-y-auto lg:pt-0 pt-14">
          {children}
        </main>
      </div>
    </div>
  );
}
