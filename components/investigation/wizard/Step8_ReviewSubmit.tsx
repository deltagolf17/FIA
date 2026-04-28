"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Loader2, Shield, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { WizardState } from "@/types";

interface Props {
  state: WizardState;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string;
}

interface Flag {
  label: string;
  blocking: boolean;
}

function getFlags(state: WizardState): Flag[] {
  const flags: Flag[] = [];
  const b = state.incidentBasics;
  const s = state.sceneCondition;
  const o = state.originDetermination;
  const c = state.causeClassification;
  const d = state.finalDetermination;

  // Blocking — required to save
  if (!b.incidentDate) flags.push({ label: "Incident date is required", blocking: true });
  if (!b.address)      flags.push({ label: "Street address is required", blocking: true });
  if (!b.city)         flags.push({ label: "City is required", blocking: true });
  if (!b.state)        flags.push({ label: "State is required", blocking: true });

  // Recommended
  if (!b.occupancyType)             flags.push({ label: "Occupancy type not set (Step 1)", blocking: false });
  if (!s.structureType)             flags.push({ label: "Structure type not set (Step 2)", blocking: false });
  if (!s.weatherConditions)         flags.push({ label: "Weather conditions not recorded (Step 2)", blocking: false });
  if (state.firePatterns.length === 0) flags.push({ label: "No fire patterns documented (Step 3)", blocking: false });
  if (state.evidence.length === 0)  flags.push({ label: "No evidence items recorded (Step 4)", blocking: false });
  if (!o.areaOfOrigin)              flags.push({ label: "Area of origin not determined (Step 5)", blocking: false });
  if (!o.originNarrative)           flags.push({ label: "Origin narrative not written (Step 5)", blocking: false });
  if (!c.firstMaterialIgnited)      flags.push({ label: "First material ignited not identified (Step 6)", blocking: false });
  if (!c.ignitionSource)            flags.push({ label: "Ignition source not identified (Step 6)", blocking: false });
  if (!d.causeCode)                 flags.push({ label: "NFPA 921 cause classification not selected (Step 7)", blocking: false });
  if (!d.causeNarrative)            flags.push({ label: "Cause narrative not written (Step 7)", blocking: false });
  if (!d.determination)             flags.push({ label: "Determination statement not written (Step 7)", blocking: false });

  return flags;
}

export function Step8_ReviewSubmit({ state, onBack, onSubmit, submitting, error }: Props) {
  const flags = getFlags(state);
  const blocking = flags.filter(f => f.blocking);
  const warnings = flags.filter(f => !f.blocking);
  const canSubmit = blocking.length === 0;

  const b = state.incidentBasics;
  const d = state.finalDetermination;

  return (
    <div className="space-y-6 p-2">
      <div className="flex items-start gap-3 bg-authority-50 border border-authority-100 rounded-xl p-4">
        <Shield className="w-4 h-4 text-authority-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-authority-800">Review & Submit</p>
          <p className="text-xs text-authority-600 mt-0.5">Review what has been filled in. Blocking issues must be resolved before submitting. Warnings are recommended fields that can be completed later.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Summary</p>
        {[
          { label: "Address",       value: b.address ? `${b.address}, ${b.city}, ${b.state}` : null },
          { label: "Incident Date", value: b.incidentDate || null },
          { label: "Occupancy",     value: b.occupancyType || null },
          { label: "Structure",     value: state.sceneCondition.structureType?.replace(/_/g, " ") || null },
          { label: "Fire Patterns", value: state.firePatterns.length > 0 ? `${state.firePatterns.length} documented` : null },
          { label: "Evidence",      value: state.evidence.length > 0 ? `${state.evidence.length} item(s)` : null },
          { label: "Area of Origin",value: state.originDetermination.areaOfOrigin || null },
          { label: "Cause",         value: d.causeCode || null },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-slate-500 text-xs">{label}</span>
            {value
              ? <span className="text-slate-800 text-xs font-medium">{value}</span>
              : <span className="text-slate-300 text-xs italic">not set</span>
            }
          </div>
        ))}
      </div>

      {/* Blocking errors */}
      {blocking.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <XCircle className="w-3.5 h-3.5" /> Must fix before submitting
          </p>
          {blocking.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-red-700">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              {f.label}
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" /> Incomplete fields (can be added later)
          </p>
          {warnings.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {f.label}
            </div>
          ))}
        </div>
      )}

      {/* All clear */}
      {flags.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800 font-medium">All fields complete — ready to submit.</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>Back</Button>
        <Button
          type="button"
          variant="fire"
          disabled={submitting || !canSubmit}
          onClick={onSubmit}
          className={cn(!canSubmit && "opacity-50 cursor-not-allowed")}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Investigation...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Create Investigation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
