import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { NFPAClassificationBadge } from "@/components/investigation/NFPAClassificationBadge";
import { NewClaimModal } from "@/components/insurance/NewClaimModal";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { Building2, DollarSign, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

async function getPageData(page: number) {
  const [claims, totalClaims, investigations] = await Promise.all([
    prisma.insuranceClaim.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { investigation: { select: { caseNumber: true, causeCode: true, address: true } } },
    }),
    prisma.insuranceClaim.count(),
    prisma.investigation.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, caseNumber: true, address: true, insuranceClaim: { select: { id: true } } },
    }),
  ]);
  return { claims, totalClaims, totalPages: Math.ceil(totalClaims / PAGE_SIZE), investigations };
}

const CLAIM_STATUS_COLORS: Record<string, string> = {
  OPEN:         "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
  APPROVED:     "bg-green-100 text-green-800",
  DENIED:       "bg-red-100 text-red-800",
  CLOSED:       "bg-slate-100 text-slate-600",
};

export default async function InsurancePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { claims, totalClaims, totalPages, investigations } = await getPageData(page);
  const totalExposure = claims.reduce((sum, c) => sum + (c.estimatedLoss ?? 0), 0);
  const investigationOptions = investigations.map((inv) => ({
    id: inv.id,
    caseNumber: inv.caseNumber,
    address: inv.address,
    hasClam: !!inv.insuranceClaim,
  }));

  const openClaims = claims.filter((c) => c.status === "OPEN" || c.status === "UNDER_REVIEW").length;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Insurance Portal"
        subtitle="Claims management and adjuster workflow"
        action={<NewClaimModal investigations={investigationOptions} />}
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-authority-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-authority-800" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Claims</p>
                <p className="text-2xl font-bold text-authority-800">{claims.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-fire-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-fire-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Open / Under Review</p>
                <p className="text-2xl font-bold text-fire-600">{openClaims}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Estimated Exposure</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalExposure)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims table */}
        {claims.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="font-medium text-slate-600">No insurance claims yet</p>
            <p className="text-sm text-slate-400 mt-1">Click &quot;New Claim&quot; to link a claim to an investigation.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Claim #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Case</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Insured</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Insurer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Est. Loss</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cause</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-authority-800">
                      <Link href={`/insurance/${claim.id}`} className="hover:underline">{claim.claimNumber}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/investigations/${claim.investigationId}`} className="font-mono text-xs text-authority-700 hover:underline">
                        {claim.investigation.caseNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{claim.insuredName}</td>
                    <td className="px-4 py-3 text-slate-600">{claim.insurerName}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {claim.estimatedLoss ? formatCurrency(claim.estimatedLoss) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <NFPAClassificationBadge code={claim.investigation.causeCode} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", CLAIM_STATUS_COLORS[claim.status] ?? "bg-slate-100 text-slate-600")}>
                        {claim.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(claim.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalClaims)} of {totalClaims} claims
            </span>
            <div className="flex items-center gap-1">
              {page > 1 && (
                <Link href={`/insurance?page=${page - 1}`}>
                  <Button variant="outline" size="sm">← Prev</Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/insurance?page=${page + 1}`}>
                  <Button variant="outline" size="sm">Next →</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
