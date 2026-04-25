import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { NFPAClassificationBadge } from "@/components/investigation/NFPAClassificationBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusColor } from "@/lib/nfpa/nfpa921";
import { formatDate } from "@/lib/utils/formatters";
import { Plus, Flame, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface SearchParams {
  status?: string;
  q?: string;
}

async function getInvestigations(searchParams: SearchParams) {
  const where: Record<string, unknown> = {};
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.q) {
    where.OR = [
      { caseNumber: { contains: searchParams.q } },
      { address: { contains: searchParams.q } },
      { city: { contains: searchParams.q } },
    ];
  }
  return prisma.investigation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      investigator: { select: { name: true } },
      _count: { select: { evidence: true } },
    },
  });
}

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Pending Review", value: "PENDING_REVIEW" },
  { label: "Closed", value: "CLOSED" },
];

export default async function InvestigationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const investigations = await getInvestigations(params);

  return (
    <div className="flex flex-col h-full">
      <Header title="Investigations" subtitle={`${investigations.length} case${investigations.length !== 1 ? "s" : ""}`} />

      <div className="flex-1 p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <Link key={f.value} href={f.value ? `?status=${f.value}` : "/investigations"}>
                <button
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                    params.status === f.value || (!params.status && f.value === "")
                      ? "bg-authority-800 text-white border-authority-800"
                      : "bg-white text-slate-600 border-slate-200 hover:border-authority-300"
                  )}
                >
                  {f.label}
                </button>
              </Link>
            ))}
          </div>

          <Link href="/investigations/new">
            <Button size="sm" variant="fire">
              <Plus className="w-3.5 h-3.5" />
              New Investigation
            </Button>
          </Link>
        </div>

        {/* Table */}
        {investigations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
            <Flame className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium text-slate-600">No investigations found</p>
            <p className="text-sm mt-1">Start by creating a new investigation.</p>
            <Link href="/investigations/new" className="mt-4">
              <Button variant="fire" size="sm">
                <Plus className="w-3.5 h-3.5" />
                Create Investigation
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Case #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Address</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cause</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Investigator</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Evidence</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {investigations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-authority-800">{inv.caseNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[200px]">
                        <p className="font-medium text-slate-900 truncate">{inv.address}</p>
                        <p className="text-xs text-slate-500">{inv.city}, {inv.state}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", getStatusColor(inv.status))}>
                        {inv.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <NFPAClassificationBadge code={inv.causeCode} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{inv.investigator.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <FileText className="w-3 h-3" />
                        {inv._count.evidence}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/investigations/${inv.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
