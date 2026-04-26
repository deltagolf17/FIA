"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NFPAClassificationBadge } from "@/components/investigation/NFPAClassificationBadge";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import { Download, Printer, FileText, Flame, Package, Shield, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Investigation {
  id: string;
  caseNumber: string;
  status: string;
  incidentDate: Date;
  address: string;
  city: string;
  state: string;
  zip: string;
  occupancyType: string | null;
  structureType: string | null;
  areaOfOrigin: string | null;
  pointOfOrigin: string | null;
  causeCode: string | null;
  causeNarrative: string | null;
  firstMaterialIgnited: string | null;
  ignitionSource: string | null;
  determination: string | null;
  notes: string | null;
  weatherConditions: string | null;
  utilitiesGas: string | null;
  utilitiesElectric: string | null;
  utilitiesWater: string | null;
  investigator: { name: string; email: string };
  evidence: Array<{
    itemNumber: string;
    description: string;
    location: string;
    collectedBy: string;
    collectedAt: Date;
    labSubmitted: boolean;
  }>;
  firePatterns: Array<{
    patternType: string;
    location: string;
    description: string;
    charDepth: number | null;
    nfpaSection: string | null;
  }>;
}

interface ReportBuilderProps {
  investigation: Investigation;
}

const SECTIONS = [
  { id: "executive",  label: "Executive Summary",       icon: Shield },
  { id: "scene",      label: "Scene Description",        icon: Flame },
  { id: "patterns",   label: "Fire Pattern Analysis",    icon: Flame },
  { id: "origin",     label: "Origin Determination",     icon: CheckCircle },
  { id: "cause",      label: "Cause Classification",     icon: CheckCircle },
  { id: "evidence",   label: "Evidence Summary",         icon: Package },
  { id: "conclusion", label: "Conclusions",              icon: FileText },
];

export function ReportBuilder({ investigation: inv }: ReportBuilderProps) {
  const [sections, setSections] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTIONS.map((s) => [s.id, true]))
  );
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  function toggleSection(id: string) {
    setSections((s) => ({ ...s, [id]: !s[id] }));
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  async function handlePDF() {
    if (typeof window === "undefined") return;
    setPdfLoading(true);
    setPdfError("");
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const el = printRef.current;
      if (!el) throw new Error("Report element not found");

      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Multi-page: split if content exceeds one page
      const pageHeight = pdf.internal.pageSize.getHeight();
      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      } else {
        let yOffset = 0;
        while (yOffset < pdfHeight) {
          pdf.addImage(imgData, "PNG", 0, -yOffset, pdfWidth, pdfHeight);
          yOffset += pageHeight;
          if (yOffset < pdfHeight) pdf.addPage();
        }
      }

      pdf.save(`${inv.caseNumber}-report.pdf`);
    } catch (e) {
      setPdfError(`PDF export failed: ${(e as Error).message}`);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="flex h-full">
      {/* Controls sidebar */}
      <div className="w-56 shrink-0 border-r border-slate-200 bg-white p-4 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Report Sections</p>
        <div className="space-y-1.5">
          {SECTIONS.map((s) => (
            <label key={s.id} className="flex items-center gap-2.5 cursor-pointer group">
              <div className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                sections[s.id] ? "bg-authority-800 border-authority-800" : "border-slate-300"
              )} onClick={() => toggleSection(s.id)}>
                {sections[s.id] && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              <span className="text-xs text-slate-700 group-hover:text-slate-900">{s.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <Button size="sm" className="w-full" onClick={handlePDF} disabled={pdfLoading}>
            {pdfLoading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Download className="w-3.5 h-3.5" />
            }
            {pdfLoading ? "Generating…" : "Export PDF"}
          </Button>
          {pdfError && (
            <div className="flex items-start gap-1.5 text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
              {pdfError}
            </div>
          )}
          <Button size="sm" variant="outline" className="w-full no-print" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>
        </div>
      </div>

      {/* Report preview */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
        <div
          ref={printRef}
          className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
          style={{ minHeight: "1100px" }}
        >
          {/* Report Header */}
          <div className="gradient-fire p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/70 uppercase tracking-widest mb-1">FireTrace Pro</p>
                <h1 className="text-2xl font-bold">Fire Investigation Report</h1>
                <p className="text-white/80 mt-1">{inv.address}, {inv.city}, {inv.state} {inv.zip}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold">{inv.caseNumber}</p>
                <p className="text-white/70 text-sm">{formatDate(inv.incidentDate)}</p>
                <NFPAClassificationBadge code={inv.causeCode} />
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Executive Summary */}
            {sections.executive && (
              <ReportSection title="Executive Summary" icon="🔍">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="Case Number" value={inv.caseNumber} mono />
                  <Field label="Incident Date" value={formatDate(inv.incidentDate)} />
                  <Field label="Location" value={`${inv.address}, ${inv.city}, ${inv.state}`} />
                  <Field label="Occupancy" value={inv.occupancyType ?? "—"} />
                  <Field label="Investigator" value={inv.investigator.name} />
                  <Field label="NFPA 921 Cause" value={inv.causeCode ?? "Pending"} />
                </div>
                {inv.determination && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border-l-4 border-authority-700">
                    <p className="text-sm font-medium text-slate-900">{inv.determination}</p>
                  </div>
                )}
              </ReportSection>
            )}

            {/* Scene Description */}
            {sections.scene && (
              <ReportSection title="Scene Description" icon="🏠" nfpa="NFPA 921 §13">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Structure Type" value={inv.structureType?.replace(/_/g, " ") ?? "—"} />
                  <Field label="Weather" value={inv.weatherConditions ?? "—"} />
                  <Field label="Gas Utilities" value={inv.utilitiesGas ?? "Unknown"} />
                  <Field label="Electric" value={inv.utilitiesElectric ?? "Unknown"} />
                </div>
              </ReportSection>
            )}

            {/* Fire Patterns */}
            {sections.patterns && inv.firePatterns.length > 0 && (
              <ReportSection title="Fire Pattern Analysis" icon="🔥" nfpa="NFPA 921 §6">
                <div className="space-y-3">
                  {inv.firePatterns.map((p, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-fire-700">{p.patternType.replace(/_/g, " ")}</span>
                        {p.nfpaSection && <span className="text-xs text-slate-400">{p.nfpaSection}</span>}
                      </div>
                      <p className="text-xs text-slate-500">Location: {p.location}</p>
                      <p className="text-sm text-slate-700 mt-1">{p.description}</p>
                      {p.charDepth && <p className="text-xs text-slate-500 mt-1">Char depth: {p.charDepth} mm</p>}
                    </div>
                  ))}
                </div>
              </ReportSection>
            )}

            {/* Origin */}
            {sections.origin && (
              <ReportSection title="Origin Determination" icon="📍" nfpa="NFPA 921 §14">
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <Field label="Area of Origin" value={inv.areaOfOrigin ?? "Not determined"} />
                  <Field label="Point of Origin" value={inv.pointOfOrigin ?? "Not determined"} />
                </div>
              </ReportSection>
            )}

            {/* Cause */}
            {sections.cause && (
              <ReportSection title="Cause Classification" icon="⚡" nfpa="NFPA 921 §20">
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <Field label="NFPA 921 Classification" value={inv.causeCode ?? "Undetermined"} />
                  <Field label="First Material Ignited" value={inv.firstMaterialIgnited ?? "—"} />
                  <Field label="Ignition Source" value={inv.ignitionSource ?? "—"} />
                </div>
                {inv.causeNarrative && (
                  <p className="text-sm text-slate-700 leading-relaxed">{inv.causeNarrative}</p>
                )}
              </ReportSection>
            )}

            {/* Evidence */}
            {sections.evidence && inv.evidence.length > 0 && (
              <ReportSection title="Evidence Summary" icon="📦" nfpa="NFPA 921 §15">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-1 font-semibold text-slate-600">Item #</th>
                      <th className="text-left py-1 font-semibold text-slate-600">Description</th>
                      <th className="text-left py-1 font-semibold text-slate-600">Location</th>
                      <th className="text-left py-1 font-semibold text-slate-600">Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.evidence.map((e) => (
                      <tr key={e.itemNumber} className="border-b border-slate-100">
                        <td className="py-1.5 font-mono font-semibold text-authority-700">{e.itemNumber}</td>
                        <td className="py-1.5">{e.description}</td>
                        <td className="py-1.5 text-slate-500">{e.location}</td>
                        <td className="py-1.5 text-slate-500">{formatDate(e.collectedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ReportSection>
            )}

            {/* Conclusion */}
            {sections.conclusion && (
              <ReportSection title="Conclusions" icon="✅">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {inv.determination ?? "Investigation is ongoing. Final determination pending."}
                </p>
              </ReportSection>
            )}

            {/* Signature block */}
            <div className="border-t-2 border-slate-200 pt-6 mt-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="h-12 border-b-2 border-slate-900 mb-1" />
                  <p className="text-xs text-slate-600">{inv.investigator.name} — Investigator</p>
                  <p className="text-xs text-slate-400">NFPA 1033 Certified</p>
                </div>
                <div>
                  <div className="h-12 border-b-2 border-slate-900 mb-1" />
                  <p className="text-xs text-slate-600">Date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportSection({ title, icon, nfpa, children }: {
  title: string;
  icon: string;
  nfpa?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>{icon}</span>{title}
        </h2>
        {nfpa && <span className="text-xs text-authority-600 bg-authority-50 px-2 py-0.5 rounded">{nfpa}</span>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn("font-medium text-slate-900", mono && "font-mono")}>{value}</p>
    </div>
  );
}
