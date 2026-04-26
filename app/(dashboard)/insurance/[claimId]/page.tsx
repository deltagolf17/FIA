import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NFPAClassificationBadge } from "@/components/investigation/NFPAClassificationBadge";
import { ClaimStatusDropdown } from "@/components/insurance/ClaimStatusDropdown";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import {
  Building2, DollarSign, FileText, User,
  Calendar, MapPin, Package, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { EditClaimButton } from "@/components/insurance/EditClaimButton";

interface Props {
  params: Promise<{ claimId: string }>;
}

async function getClaim(id: string) {
  return prisma.insuranceClaim.findUnique({
    where: { id },
    include: {
      investigation: {
        include: {
          investigator: true,
          evidence: true,
          firePatterns: true,
          checklistItems: true,
        },
      },
    },
  });
}

export default async function ClaimDetailPage({ params }: Props) {
  const { claimId } = await params;
  const claim = await getClaim(claimId);
  if (!claim) notFound();

  const inv = claim.investigation;
  const checklistDone = inv.checklistItems.filter((c) => c.completed).length;
  const checklistTotal = inv.checklistItems.length;
  const complianceScore = checklistTotal > 0
    ? Math.round((checklistDone / checklistTotal) * 100)
    : 0;

  const isIncendiary = inv.causeCode === "INCENDIARY";

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`Claim ${claim.claimNumber}`}
        subtitle={`${claim.insuredName} — ${inv.address}, ${inv.city}, ${inv.state}`}
      />

      <div className="flex-1 p-6 overflow-y-auto space-y-5">
        {/* Incendiary alert */}
        {isIncendiary && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">Incendiary Fire — High Priority</p>
              <p className="text-xs text-red-600">
                The linked fire investigation has been classified as INCENDIARY (intentionally set).
                Review investigation findings before approving this claim.
              </p>
            </div>
          </div>
        )}

        {/* Status bar */}
        <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 flex-wrap">
          <ClaimStatusDropdown claimId={claim.id} currentStatus={claim.status} />
          <NFPAClassificationBadge code={inv.causeCode} />
          <span className="text-xs text-slate-500">Policy: <span className="font-mono font-semibold text-slate-700">{claim.policyNumber}</span></span>
          <span className="text-xs text-slate-500">Claim: <span className="font-mono font-semibold text-slate-700">{claim.claimNumber}</span></span>
          <div className="ml-auto flex items-center gap-3">
            <EditClaimButton claim={{
              id:            claim.id,
              adjusterName:  claim.adjusterName,
              adjusterEmail: claim.adjusterEmail,
              estimatedLoss: claim.estimatedLoss,
              finalLoss:     claim.finalLoss,
              notes:         claim.notes,
            }} />
            <Link
              href={`/investigations/${inv.id}`}
              className="text-xs font-medium text-authority-700 hover:underline flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              View Investigation {inv.caseNumber}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Claim details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <Building2 className="w-4 h-4 text-authority-700" /> Claim Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { label: "Insured Name",  value: claim.insuredName },
                    { label: "Insurer",       value: claim.insurerName },
                    { label: "Policy Number", value: claim.policyNumber, mono: true },
                    { label: "Coverage Type", value: claim.coverageType ?? "—" },
                    { label: "Adjuster",      value: claim.adjusterName ?? "—" },
                    { label: "Adjuster Email",value: claim.adjusterEmail ?? "—" },
                    { label: "Created",       value: formatDate(claim.createdAt) },
                    { label: "Last Updated",  value: formatDate(claim.updatedAt) },
                  ].map(({ label, value, mono }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className={cn("text-sm font-medium text-slate-900 mt-0.5", mono && "font-mono")}>{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <DollarSign className="w-4 h-4 text-green-600" /> Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      label: "Estimated Loss",
                      value: claim.estimatedLoss ? formatCurrency(claim.estimatedLoss) : "—",
                      color: "text-slate-900",
                    },
                    {
                      label: "Deductible",
                      value: claim.deductible ? formatCurrency(claim.deductible) : "—",
                      color: "text-slate-900",
                    },
                    {
                      label: "Final Loss",
                      value: claim.finalLoss ? formatCurrency(claim.finalLoss) : "Pending",
                      color: claim.finalLoss ? "text-green-700 font-bold" : "text-slate-400",
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">{label}</p>
                      <p className={cn("text-lg font-bold", color)}>{value}</p>
                    </div>
                  ))}
                </div>
                {claim.notes && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Notes</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{claim.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Linked investigation overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-fire-600" /> Linked Investigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {[
                    { label: "Case Number",     value: inv.caseNumber, mono: true },
                    { label: "Incident Date",   value: formatDate(inv.incidentDate) },
                    { label: "Address",         value: `${inv.address}, ${inv.city}, ${inv.state}` },
                    { label: "Structure",       value: inv.structureType?.replace(/_/g, " ") ?? "—" },
                    { label: "Investigator",    value: inv.investigator.name },
                    { label: "NFPA Compliance", value: `${complianceScore}%` },
                    { label: "Area of Origin",  value: inv.areaOfOrigin ?? "Pending" },
                    { label: "Point of Origin", value: inv.pointOfOrigin ?? "Pending" },
                    { label: "First Material",  value: inv.firstMaterialIgnited ?? "—" },
                    { label: "Ignition Source", value: inv.ignitionSource ?? "—" },
                  ].map(({ label, value, mono }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className={cn("font-medium text-slate-900", mono && "font-mono text-xs")}>{value}</p>
                    </div>
                  ))}
                </div>
                {inv.causeNarrative && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Cause Narrative</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{inv.causeNarrative}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* NFPA compliance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-700">NFPA 921 Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className={cn(
                    "text-4xl font-black",
                    complianceScore >= 80 ? "text-green-600" :
                    complianceScore >= 50 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {complianceScore}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{checklistDone}/{checklistTotal} items complete</p>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      complianceScore >= 80 ? "bg-green-500" :
                      complianceScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${complianceScore}%` }}
                  />
                </div>
                {complianceScore < 80 && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mt-3">
                    Investigation below 80% compliance threshold. Review before approving claim.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Evidence summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <Package className="w-4 h-4 text-purple-600" />
                  Evidence ({inv.evidence.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inv.evidence.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">No evidence recorded</p>
                ) : (
                  <div className="space-y-2">
                    {inv.evidence.map((e) => (
                      <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                        <div>
                          <span className="font-mono text-xs text-authority-700 font-semibold">{e.itemNumber}</span>
                          <span className="text-xs text-slate-600 ml-2">{e.description}</span>
                        </div>
                        {e.labSubmitted && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full shrink-0">Lab</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fire patterns */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-700">
                  Fire Patterns ({inv.firePatterns.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inv.firePatterns.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">No patterns documented</p>
                ) : (
                  <div className="space-y-1.5">
                    {inv.firePatterns.map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <span className="text-xs bg-fire-100 text-fire-800 px-2 py-0.5 rounded-full">
                          {p.patternType.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-slate-500 truncate">{p.location}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
