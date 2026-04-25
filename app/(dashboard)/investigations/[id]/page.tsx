import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NFPAClassificationBadge } from "@/components/investigation/NFPAClassificationBadge";
import { getStatusColor } from "@/lib/nfpa/nfpa921";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { MapPin, Calendar, User, Building, Cloud, Zap, FileText, Package, Flame } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getInvestigation(id: string) {
  return prisma.investigation.findUnique({
    where: { id },
    include: {
      investigator: true,
      evidence: { include: { chainOfCustody: { orderBy: { timestamp: "asc" } } } },
      firePatterns: true,
      insuranceClaim: true,
      checklistItems: true,
    },
  });
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvestigationDetailPage({ params }: Props) {
  const { id } = await params;
  const inv = await getInvestigation(id);
  if (!inv) notFound();

  const checklistCompleted = inv.checklistItems.filter((c) => c.completed).length;
  const checklistTotal = inv.checklistItems.length;
  const complianceScore = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      <Header
        title={inv.caseNumber}
        subtitle={`${inv.address}, ${inv.city}, ${inv.state}`}
      />

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {/* Top summary bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className={cn("text-xs font-medium px-3 py-1.5 rounded-full", getStatusColor(inv.status))}>
            {inv.status.replace("_", " ")}
          </span>
          <NFPAClassificationBadge code={inv.causeCode} />
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3.5 h-3.5" />
            {inv.investigator.name}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(inv.incidentDate)}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">NFPA 921 Compliance</span>
              <span className={cn(
                "font-bold",
                complianceScore >= 80 ? "text-green-600" : complianceScore >= 50 ? "text-yellow-600" : "text-red-600"
              )}>
                {complianceScore}%
              </span>
              <div className="w-24 h-1.5 bg-slate-200 rounded-full">
                <div className={cn(
                  "h-full rounded-full transition-all",
                  complianceScore >= 80 ? "bg-green-500" : complianceScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                )} style={{ width: `${complianceScore}%` }} />
              </div>
            </div>
            <Link href={`/investigations/${id}/report`}>
              <Button size="sm" variant="outline">
                <FileText className="w-3.5 h-3.5" />
                Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="evidence">
              Evidence ({inv.evidence.length})
            </TabsTrigger>
            <TabsTrigger value="patterns">
              Fire Patterns ({inv.firePatterns.length})
            </TabsTrigger>
            <TabsTrigger value="checklist">
              NFPA Checklist ({checklistCompleted}/{checklistTotal})
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4">
              {/* Incident Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-fire-600" /> Incident Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    { label: "Address",      value: `${inv.address}, ${inv.city}, ${inv.state} ${inv.zip}` },
                    { label: "Incident Date", value: formatDate(inv.incidentDate) },
                    { label: "Dispatch",     value: inv.dispatchTime ? formatDateTime(inv.dispatchTime) : "—" },
                    { label: "Arrival",      value: inv.arrivalTime ? formatDateTime(inv.arrivalTime) : "—" },
                    { label: "Occupancy",    value: inv.occupancyType ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-900 font-medium text-right max-w-[60%]">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Structure */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                    <Building className="w-4 h-4 text-authority-700" /> Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    { label: "Type",         value: inv.structureType?.replace("_", " ") ?? "—" },
                    { label: "Construction", value: inv.constructionType ?? "—" },
                    { label: "Stories",      value: inv.numStories?.toString() ?? "—" },
                    { label: "Building Age", value: inv.buildingAge ? `${inv.buildingAge} years` : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-900 font-medium">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Origin & Cause */}
              <Card className="col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                    <Flame className="w-4 h-4 text-fire-600" /> Origin & Cause Determination
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Area of Origin — NFPA 921 §14.3</p>
                      <p className="font-medium text-slate-900">{inv.areaOfOrigin ?? "Not determined"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Point of Origin — NFPA 921 §14.4</p>
                      <p className="font-medium text-slate-900">{inv.pointOfOrigin ?? "Not determined"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">First Material Ignited</p>
                      <p className="font-medium text-slate-900">{inv.firstMaterialIgnited ?? "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Ignition Source</p>
                      <p className="font-medium text-slate-900">{inv.ignitionSource ?? "Unknown"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500 mb-1">Cause Narrative — NFPA 921 §20</p>
                      <p className="text-slate-700 text-sm leading-relaxed">{inv.causeNarrative ?? "No narrative recorded."}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500 mb-1">Final Determination</p>
                      <p className="text-slate-700 text-sm">{inv.determination ?? "Pending determination."}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* EVIDENCE */}
          <TabsContent value="evidence">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-700">Evidence Chain of Custody</h3>
              </div>
              {inv.evidence.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No evidence items recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inv.evidence.map((e) => (
                    <Card key={e.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-authority-800">{e.itemNumber}</span>
                              {e.labSubmitted && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Lab Submitted</span>
                              )}
                            </div>
                            <p className="font-medium text-sm text-slate-900">{e.description}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Collected from: {e.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">{formatDate(e.collectedAt)}</p>
                            <p className="text-xs text-slate-400">by {e.collectedBy}</p>
                          </div>
                        </div>
                        {e.chainOfCustody.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <p className="text-xs font-medium text-slate-500 mb-2">Chain of Custody</p>
                            <div className="space-y-1">
                              {e.chainOfCustody.map((entry) => (
                                <div key={entry.id} className="flex items-center gap-2 text-xs text-slate-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-authority-400 shrink-0" />
                                  <span className="font-medium">{entry.action}</span>
                                  <span>by {entry.handledBy}</span>
                                  <span className="text-slate-400">— {formatDateTime(entry.timestamp)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* FIRE PATTERNS */}
          <TabsContent value="patterns">
            <div className="space-y-3">
              {inv.firePatterns.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200">
                  <Flame className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No fire patterns documented</p>
                </div>
              ) : (
                inv.firePatterns.map((p, i) => (
                  <Card key={p.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium bg-fire-100 text-fire-800 px-2 py-0.5 rounded-full">
                            {p.patternType.replace("_", " ")}
                          </span>
                          {p.nfpaSection && (
                            <span className="text-xs text-authority-600 bg-authority-50 px-2 py-0.5 rounded">{p.nfpaSection}</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">Pattern #{i + 1}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">Location: <span className="text-slate-700 font-medium">{p.location}</span></p>
                      <p className="text-sm text-slate-700">{p.description}</p>
                      {p.charDepth && (
                        <p className="text-xs text-slate-500 mt-2">Char depth: <span className="font-medium">{p.charDepth} mm</span></p>
                      )}
                      {p.significance && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <p className="text-xs text-slate-500">Significance: {p.significance}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* NFPA CHECKLIST */}
          <TabsContent value="checklist">
            <NFPAChecklistPanel
              items={inv.checklistItems}
              investigationId={inv.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function NFPAChecklistPanel({
  items,
  investigationId,
}: {
  items: Array<{ id: string; category: string; requirement: string; nfpaSection: string; completed: boolean }>;
  investigationId: string;
}) {
  const categories = ["SCENE", "DOCUMENTATION", "ORIGIN", "CAUSE", "REPORT"];

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        const done = catItems.filter((i) => i.completed).length;
        return (
          <Card key={cat}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{cat}</CardTitle>
                <span className="text-xs text-slate-500">{done}/{catItems.length}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {catItems.map((item) => (
                <div key={item.id} className={cn(
                  "flex items-start gap-3 p-2.5 rounded-lg",
                  item.completed ? "bg-green-50" : "bg-slate-50"
                )}>
                  <div className={cn(
                    "w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center",
                    item.completed ? "bg-green-500" : "border-2 border-slate-300"
                  )}>
                    {item.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-medium", item.completed ? "text-green-800" : "text-slate-700")}>
                      {item.requirement}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.nfpaSection}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
