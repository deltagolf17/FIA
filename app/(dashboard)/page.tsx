import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { KPICards } from "@/components/dashboard/KPICards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CauseTrendsChart } from "@/components/dashboard/CauseTrendsChart";
import { ActiveCasesMap } from "@/components/dashboard/ActiveCasesMap";
import { EmergencyWAPanel } from "@/components/dashboard/EmergencyWAPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, MapPin } from "lucide-react";

async function getDashboardData() {
  const [open, inProgress, closed, incendiary, recent, investigations, mapPins] = await Promise.all([
    prisma.investigation.count({ where: { status: "OPEN" } }),
    prisma.investigation.count({ where: { status: "IN_PROGRESS" } }),
    prisma.investigation.count({ where: { status: "CLOSED" } }),
    prisma.investigation.count({ where: { causeCode: "INCENDIARY" } }),
    prisma.investigation.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: { id: true, caseNumber: true, address: true, status: true, createdAt: true },
    }),
    prisma.investigation.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { createdAt: true, causeCode: true },
    }),
    prisma.investigation.findMany({
      where: { lat: { not: null } },
      select: { id: true, caseNumber: true, address: true, city: true, state: true, status: true, causeCode: true, lat: true, lng: true },
    }),
  ]);

  // Build 6-month trend
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toLocaleString("default", { month: "short" });
  });

  const trendData = months.map((month, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const nextD = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
    const monthItems = investigations.filter((inv) => {
      const t = new Date(inv.createdAt);
      return t >= d && t < nextD;
    });
    return {
      month,
      NATURAL:      monthItems.filter((i) => i.causeCode === "NATURAL").length,
      ACCIDENTAL:   monthItems.filter((i) => i.causeCode === "ACCIDENTAL").length,
      INCENDIARY:   monthItems.filter((i) => i.causeCode === "INCENDIARY").length,
      UNDETERMINED: monthItems.filter((i) => i.causeCode === "UNDETERMINED" || !i.causeCode).length,
    };
  });

  return { stats: { open, inProgress, closed, incendiary }, recent, trendData, mapPins };
}

export default async function DashboardPage() {
  const session = await auth();
  const { stats, recent, trendData, mapPins } = await getDashboardData();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${session?.user?.name?.split(" ")[0] ?? "Investigator"}`}
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* KPI Cards */}
        <KPICards stats={stats} />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-authority-700" />
                  Fire Cause Trends — Last 6 Months
                </CardTitle>
                <span className="text-xs text-slate-400">NFPA 921 Classification</span>
              </div>
            </CardHeader>
            <CardContent>
              <CauseTrendsChart data={trendData} />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Recent Investigations</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <RecentActivity items={recent} />
            </CardContent>
          </Card>
        </div>

        {/* Active cases map */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-fire-600" />
              Active Cases — Geographic Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ActiveCasesMap pins={mapPins.map((p) => ({
              ...p,
              lat: p.lat!,
              lng: p.lng!,
            }))} />
          </CardContent>
        </Card>

        {/* Emergency WA live feed */}
        <EmergencyWAPanel />
      </div>
    </div>
  );
}
