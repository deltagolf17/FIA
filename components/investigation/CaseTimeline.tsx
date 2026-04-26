"use client";

import { formatDateTime } from "@/lib/utils/formatters";
import {
  FolderOpen, Flame, Package, ArrowRightLeft,
  FlaskConical, GitBranch, FileCheck, Shield,
  ClipboardList, AlertTriangle, Clock,
} from "lucide-react";

interface CustodyEntry {
  id: string;
  handledBy: string;
  action: string;
  timestamp: Date | string;
  notes: string | null;
  evidenceItemNumber?: string;
}

interface EvidenceItem {
  id: string;
  itemNumber: string;
  description: string;
  collectedAt: Date | string;
  collectedBy: string;
  labSubmitted: boolean;
  labSubmittedAt: Date | string | null;
  chainOfCustody: {
    id: string;
    handledBy: string;
    action: string;
    timestamp: Date | string;
    notes: string | null;
  }[];
}

interface FirePattern {
  id: string;
  patternType: string;
  location: string;
  createdAt: Date | string;
}

interface InsuranceClaim {
  claimNumber: string;
  insuredName: string;
  createdAt: Date | string;
}

interface Props {
  investigationId: string;
  caseNumber: string;
  incidentDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  status: string;
  causeCode: string | null;
  investigatorName: string;
  evidence: EvidenceItem[];
  firePatterns: FirePattern[];
  insuranceClaim: InsuranceClaim | null;
}

interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: "case" | "incident" | "evidence" | "custody" | "pattern" | "lab" | "claim" | "compliance" | "alert";
  title: string;
  detail?: string;
  actor?: string;
}

const EVENT_STYLES: Record<string, { icon: React.ReactNode; dot: string; ring: string }> = {
  case:       { icon: <FolderOpen className="w-3.5 h-3.5" />,      dot: "bg-authority-600", ring: "ring-authority-200" },
  incident:   { icon: <Flame className="w-3.5 h-3.5" />,           dot: "bg-fire-600",      ring: "ring-fire-200" },
  evidence:   { icon: <Package className="w-3.5 h-3.5" />,         dot: "bg-blue-500",      ring: "ring-blue-200" },
  custody:    { icon: <ArrowRightLeft className="w-3.5 h-3.5" />,  dot: "bg-slate-500",     ring: "ring-slate-200" },
  lab:        { icon: <FlaskConical className="w-3.5 h-3.5" />,    dot: "bg-purple-500",    ring: "ring-purple-200" },
  pattern:    { icon: <GitBranch className="w-3.5 h-3.5" />,       dot: "bg-orange-500",    ring: "ring-orange-200" },
  claim:      { icon: <Shield className="w-3.5 h-3.5" />,          dot: "bg-green-600",     ring: "ring-green-200" },
  compliance: { icon: <ClipboardList className="w-3.5 h-3.5" />,   dot: "bg-teal-500",      ring: "ring-teal-200" },
  alert:      { icon: <AlertTriangle className="w-3.5 h-3.5" />,   dot: "bg-red-500",       ring: "ring-red-200" },
};

function toDate(v: Date | string): Date {
  return v instanceof Date ? v : new Date(v);
}

export function CaseTimeline({
  caseNumber,
  incidentDate,
  createdAt,
  updatedAt,
  causeCode,
  investigatorName,
  evidence,
  firePatterns,
  insuranceClaim,
}: Props) {
  const events: TimelineEvent[] = [];

  // Incident
  events.push({
    id: "incident",
    timestamp: toDate(incidentDate),
    type: "incident",
    title: "Fire Incident Occurred",
    detail: "Scene response initiated",
  });

  // Case opened
  events.push({
    id: "case-opened",
    timestamp: toDate(createdAt),
    type: "case",
    title: `Case ${caseNumber} Opened`,
    actor: investigatorName,
    detail: "Investigation record created in FireTrace Pro",
  });

  // Evidence collected
  for (const e of evidence) {
    events.push({
      id: `ev-${e.id}`,
      timestamp: toDate(e.collectedAt),
      type: "evidence",
      title: `Evidence ${e.itemNumber} Collected`,
      detail: e.description,
      actor: e.collectedBy,
    });

    // Lab submission
    if (e.labSubmitted && e.labSubmittedAt) {
      events.push({
        id: `lab-${e.id}`,
        timestamp: toDate(e.labSubmittedAt),
        type: "lab",
        title: `${e.itemNumber} Submitted to Lab`,
        detail: e.description,
        actor: e.collectedBy,
      });
    }

    // Chain of custody entries (skip COLLECTED — already shown above)
    for (const c of e.chainOfCustody) {
      if (c.action === "COLLECTED") continue;
      events.push({
        id: `coc-${c.id}`,
        timestamp: toDate(c.timestamp),
        type: "custody",
        title: `${e.itemNumber} — ${c.action.replace(/_/g, " ")}`,
        detail: c.notes ?? undefined,
        actor: c.handledBy,
      });
    }
  }

  // Fire patterns documented
  for (const p of firePatterns) {
    events.push({
      id: `pat-${p.id}`,
      timestamp: toDate(p.createdAt),
      type: "pattern",
      title: `Fire Pattern Documented`,
      detail: `${p.patternType.replace(/_/g, " ")} — ${p.location}`,
    });
  }

  // Insurance claim filed
  if (insuranceClaim) {
    events.push({
      id: "claim",
      timestamp: toDate(insuranceClaim.createdAt),
      type: "claim",
      title: `Insurance Claim Filed`,
      detail: `${insuranceClaim.claimNumber} · ${insuranceClaim.insuredName}`,
    });
  }

  // Incendiary flag
  if (causeCode === "INCENDIARY") {
    // Approximate — tie to updatedAt since we don't track when causeCode was set
    events.push({
      id: "incendiary-flag",
      timestamp: toDate(updatedAt),
      type: "alert",
      title: "Classified as INCENDIARY",
      detail: "Supervisor notification sent per protocol",
      actor: investigatorName,
    });
  }

  // Sort chronologically
  events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
        <Clock className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm">No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-5">Case Timeline — {events.length} events</h3>
      <ol className="relative">
        {events.map((event, idx) => {
          const style = EVENT_STYLES[event.type] ?? EVENT_STYLES.case;
          const isLast = idx === events.length - 1;

          return (
            <li key={event.id} className="flex gap-4 group">
              {/* Spine */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 ring-4 ${style.dot} ${style.ring}`}>
                  {style.icon}
                </div>
                {!isLast && (
                  <div className="w-px flex-1 bg-slate-200 my-1" />
                )}
              </div>

              {/* Content */}
              <div className={`pb-6 min-w-0 flex-1 ${isLast ? "pb-0" : ""}`}>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className="text-sm font-medium text-slate-900 leading-tight">{event.title}</p>
                  <time className="text-[11px] text-slate-400 shrink-0">
                    {formatDateTime(event.timestamp)}
                  </time>
                </div>
                {event.detail && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.detail}</p>
                )}
                {event.actor && (
                  <p className="text-[11px] text-slate-400 mt-0.5">by {event.actor}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
