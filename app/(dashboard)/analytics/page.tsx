import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CauseTrendsChart } from "@/components/dashboard/CauseTrendsChart";
import { NFPA_CAUSE_CODES } from "@/lib/nfpa/nfpa921";
import { BarChart3, TrendingUp, Clock, FileCheck } from "lucide-react";

async function getAnalyticsData() {
  const all = await prisma.investigation.findMany({
    select: { status: true, causeCode: true, createdAt: true, complianceScore: true },
  });

  const byStatus = {
    OPEN:           all.filter((i) => i.status === "OPEN").length,
    IN_PROGRESS:    all.filter((i) => i.status === "IN_PROGRESS").length,
    PENDING_REVIEW: all.filter((i) => i.status === "PENDING_REVIEW").length,
    CLOSED:         all.filter((i) => i.status === "CLOSED").length,
  };

  const byCause: Record<string, number> = {};
  for (const inv of all) {
    const key = inv.causeCode ?? "UNDETERMINED";
    byCause[key] = (byCause[key] ?? 0) + 1;
  }

  const avgCompliance = all.length > 0
    ? Math.round(all.reduce((sum, i) => sum + i.complianceScore, 0) / all.length)
    : 0;

  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return d.toLocaleString("default", { month: "short" });
  });

  const trendData = months.map((month, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const nextD = new Date(now.getFullYear(), now.getMonth() - (10 - i), 1);
    const items = all.filter((inv) => {
      const t = new Date(inv.createdAt);
      return t >= d && t < nextD;
    });
    return {
      month,
      NATURAL:      items.filter((i) => i.causeCode === "NATURAL").length,
      ACCIDENTAL:   items.filter((i) => i.causeCode === "ACCIDENTAL").length,
      INCENDIARY:   items.filter((i) => i.causeCode === "INCENDIARY").length,
      UNDETERMINED: items.filter((i) => i.causeCode === "UNDETERMINED" || !i.causeCode).length,
    };
  });

  return { total: all.length, byStatus, byCause, avgCompliance, trendData };
}

export default async function AnalyticsPage() {
  const { total, byStatus, byCause, avgCompliance, trendData } = await getAnalyticsData();

  return (
    <div className="flex flex-col h-full">
      <Header title="Analytics" subtitle="Fire investigation statistics and trends" />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Top KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Cases",        value: total,          icon: BarChart3,  color: "text-authority-800", bg: "bg-authority-50" },
            { label: "Active",             value: byStatus.OPEN + byStatus.IN_PROGRESS, icon: Clock,     color: "text-fire-600",  bg: "bg-fire-50" },
            { label: "Avg Compliance",     value: `${avgCompliance}%`, icon: FileCheck,  color: "text-green-700", bg: "bg-green-50" },
            { label: "Closed",             value: byStatus.CLOSED, icon: TrendingUp, color: "text-slate-700", bg: "bg-slate-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 12-month trend */}
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700">Fire Cause Trends — Last 12 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <CauseTrendsChart data={trendData} />
            </CardContent>
          </Card>

          {/* Cause breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700">Cause Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(NFPA_CAUSE_CODES).map(([code, info]) => {
                  const count = byCause[code] ?? 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={code}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">{info.label}</span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full">
                        <div
                          className={`h-full rounded-full transition-all ${
                            code === "INCENDIARY" ? "bg-red-500" :
                            code === "ACCIDENTAL" ? "bg-authority-600" :
                            code === "NATURAL" ? "bg-green-500" : "bg-yellow-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {total === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
