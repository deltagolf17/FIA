"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const FIELD_CHECKLIST = [
  {
    title: "SECURITY & SAFETY",
    color: "text-red-700 bg-red-50 border-red-200",
    dot: "bg-red-400",
    items: [
      "Establish scene perimeter",
      "Document persons present at scene",
      "Secure evidence areas from disturbance",
      "Control scene access",
      "Assess safety hazards (structural, chemical, electrical)",
      "Coordinate with law enforcement",
      "Document weather conditions on arrival",
    ],
  },
  {
    title: "EXTERIOR SURVEY",
    color: "text-orange-700 bg-orange-50 border-orange-200",
    dot: "bg-orange-400",
    items: [
      "Photograph all four sides of structure",
      "Document construction type and materials",
      "Identify area of greatest damage",
      "Document window status (open / closed / broken)",
      "Document door status (open / closed / forced)",
      "Identify ventilation points",
      "Document exterior fire patterns",
    ],
  },
  {
    title: "INTERIOR SURVEY",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    dot: "bg-amber-400",
    items: [
      "Verify structural safety before entry",
      "Conduct room-by-room systematic survey",
      "Photograph before any disturbance",
      "Identify and document interior fire patterns",
      "Document contents and their condition",
      "Identify area of greatest interior damage",
    ],
  },
  {
    title: "FIRE PATTERNS",
    color: "text-yellow-700 bg-yellow-50 border-yellow-200",
    dot: "bg-yellow-400",
    items: [
      "Document V-patterns and inverted V-patterns (§6.3.1)",
      "Measure and record char depth variations (§6.3.3)",
      "Assess calcination of gypsum board (§6.3.2)",
      "Identify protected areas and heat shadowing (§6.3.5)",
      "Analyse pattern convergence toward origin (§14.2)",
    ],
  },
  {
    title: "EVIDENCE",
    color: "text-purple-700 bg-purple-50 border-purple-200",
    dot: "bg-purple-400",
    items: [
      "Identify items requiring collection",
      "Photograph evidence in situ before collection",
      "Document exact location of each item",
      "Use proper evidence containers",
      "Label with chain-of-custody tags",
      "Initiate chain of custody documentation",
    ],
  },
  {
    title: "ORIGIN",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    dot: "bg-blue-400",
    items: [
      "Identify origin indicators (§14.2)",
      "Assess reliability of each indicator",
      "Analyse convergence toward point of origin",
      "Define area and point of origin boundaries",
    ],
  },
  {
    title: "CAUSE",
    color: "text-green-700 bg-green-50 border-green-200",
    dot: "bg-green-400",
    items: [
      "Identify competent heat sources at origin (§20.1)",
      "Assess competency of each heat source",
      "Eliminate non-competent heat sources (§17.4)",
      "Develop ignition sequence hypothesis",
      "Classify cause per NFPA 921 §20",
    ],
  },
];

const TOTAL_ITEMS = FIELD_CHECKLIST.reduce((s, sec) => s + sec.items.length, 0);

function storageKey(id: string) {
  return `field-checklist-${id}`;
}

function loadState(id: string): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(storageKey(id)) ?? "{}");
  } catch {
    return {};
  }
}

function saveState(id: string, state: Record<string, boolean>) {
  localStorage.setItem(storageKey(id), JSON.stringify(state));
}

function itemKey(sectionIndex: number, itemIndex: number) {
  return `${sectionIndex}-${itemIndex}`;
}

export function FieldChecklistDropdown({ investigationId }: { investigationId: string }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setChecked(loadState(investigationId));
    setMounted(true);
  }, [investigationId]);

  const toggle = useCallback((key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveState(investigationId, next);
      return next;
    });
  }, [investigationId]);

  const completedCount = Object.values(checked).filter(Boolean).length;
  const pct = mounted ? Math.round((completedCount / TOTAL_ITEMS) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <ClipboardList className="w-4 h-4 text-orange-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-800">
              Field Checklist
              <span className="ml-1.5 text-xs font-normal text-slate-400">NFPA 921 Scene Procedures</span>
            </span>
            <span className={cn(
              "text-xs font-bold tabular-nums",
              pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-slate-500"
            )}>
              {mounted ? `${completedCount}/${TOTAL_ITEMS} — ${pct}%` : "—"}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-orange-400"
              )}
              style={{ width: mounted ? `${pct}%` : "0%" }}
            />
          </div>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {/* Expandable body */}
      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4">
          {FIELD_CHECKLIST.map((section, si) => {
            const sectionDone = section.items.filter((_, ii) => checked[itemKey(si, ii)]).length;
            return (
              <div key={si}>
                <div className={cn(
                  "flex items-center justify-between px-3 py-1.5 rounded-lg border mb-2",
                  section.color
                )}>
                  <span className="text-xs font-bold tracking-wide">{section.title}</span>
                  <span className="text-xs font-semibold">{sectionDone}/{section.items.length}</span>
                </div>
                <div className="space-y-1">
                  {section.items.map((item, ii) => {
                    const key = itemKey(si, ii);
                    const done = !!checked[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggle(key)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm",
                          done ? "bg-green-50 hover:bg-green-100" : "bg-slate-50 hover:bg-slate-100"
                        )}
                      >
                        {done
                          ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                          : <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                        }
                        <span className={cn(
                          "text-xs leading-snug",
                          done ? "text-green-800 line-through decoration-green-400" : "text-slate-700"
                        )}>
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Reset */}
          <button
            onClick={() => {
              setChecked({});
              saveState(investigationId, {});
            }}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors mt-1"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
