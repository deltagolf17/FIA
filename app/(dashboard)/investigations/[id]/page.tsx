import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NFPAClassificationBadge } from "@/components/investigation/NFPAClassificationBadge";
import { AIAssistPanel } from "@/components/investigation/AIAssistPanel";
import { InteractiveChecklist } from "@/components/investigation/InteractiveChecklist";
import { EvidenceSection } from "@/components/investigation/EvidenceSection";
import { StatusDropdown } from "@/components/investigation/StatusDropdown";
import { getStatusColor } from "@/lib/nfpa/nfpa921";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { MapPin, Calendar, User, Building, FileText, Package, Flame } from "lucide-react";
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
      checklistItems: { orderBy: { category: "asc" } },
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
  const complianceScore = checklistTotal > 0
    ? Math.round((checklistCompleted / checklistTotal) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full">
      <Header
        title={inv.caseNumber}
        subtitle={`${inv.address}, ${inv.city}, ${inv.state}`}
      />

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {/* Top summary bar */}
        <div className="flex items-center gap-3 flex-wrap bg-white border border-slate-200 rounded-xl px-4 py-3">
          <StatusDropdown investigationId={inv.id} currentStatus={inv.status} />
          <NFPAClassificationBadge code={inv.causeCode} />
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3.5 h-3.5" />
            {inv.investigator.name}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(inv.incidentDate)}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">NFPA 921</span>
              <span className={cn(
                "font-bold",
                complianceScore >= 80 ? "text-green-600" :
                complianceScore >= 50 ? "text-yellow-600" : "text-red-600"
              )}>
                {complianceScore}%
              </span>
              <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    complianceScore >= 80 ? "bg-green-500" :
                    complianceScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${complianceScore}%` }}
                />
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

        {/* AI Assist Panel */}
        <AIAssistPanel
          investigationId={inv.id}
          firePatterns={inv.firePatterns}
          evidence={inv.evidence}
          areaOfOrigin={inv.areaOfOrigin}
          pointOfOrigin={inv.pointOfOrigin}
          firstMaterialIgnited={inv.firstMaterialIgnited}
          ignitionSource={inv.ignitionSource}
          structureType={inv.structureType}
          weatherConditions={inv.weatherConditions}
          savedSuggestion={inv.aiSuggestion}
        />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0">
            {[
              { value: "overview",  label: "Overview" },
              { value: "evidence",  label: `Evidence (${inv.evidence.length})` },
              { value: "patterns",  label: `Fire Patterns (${inv.firePatterns.length})` },
              { value: "checklist", label: `NFPA Checklist (${checklistCompleted}/${checklistTotal})` },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-slate-200 data-[state=active]:shadow-sm rounded-lg px-3 py-1.5 text-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-fire-600" /> Incident Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Address",       value: `${inv.address}, ${inv.city}, ${inv.state} ${inv.zip}` },
                    { label: "Incident Date", value: formatDate(inv.incidentDate) },
                    { label: "Dispatch",      value: inv.dispatchTime ? formatDateTime(inv.dispatchTime) : "—" },
                    { label: "Arrival",       value: inv.arrivalTime  ? formatDateTime(inv.arrivalTime)  : "—" },
                    { label: "Occupancy",     value: inv.occupancyType ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-900 font-medium text-right max-w-[60%]">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                    <Building className="w-4 h-4 text-authority-700" /> Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Type",         value: inv.structureType?.replace(/_/g, " ") ?? "—" },
                    { label: "Construction", value: inv.constructionType ?? "—" },
                    { label: "Stories",      value: inv.numStories?.toString() ?? "—" },
                    { label: "Building Age", value: inv.buildingAge ? `${inv.buildingAge} years` : "—" },
                    { label: "Weather",      value: inv.weatherConditions ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-900 font-medium">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
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
                      <p className="text-xs text-slate-500 mb-1">Cause Narrative</p>
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
            <EvidenceSection
              items={inv.evidence.map((e) => ({
                ...e,
                investigationId: inv.id,
                caseNumber: inv.caseNumber,
              }))}
            />
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
                            {p.patternType.replace(/_/g, " ")}
                          </span>
                          {p.nfpaSection && (
                            <span className="text-xs text-authority-600 bg-authority-50 px-2 py-0.5 rounded">
                              {p.nfpaSection}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">Pattern #{i + 1}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">
                        Location: <span className="text-slate-700 font-medium">{p.location}</span>
                      </p>
                      <p className="text-sm text-slate-700">{p.description}</p>
                      {p.charDepth && (
                        <p className="text-xs text-slate-500 mt-2">
                          Char depth: <span className="font-medium">{p.charDepth} mm</span>
                        </p>
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
            <InteractiveChecklist items={inv.checklistItems} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
