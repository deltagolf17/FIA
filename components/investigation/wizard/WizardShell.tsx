"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Step1_IncidentBasics } from "./Step1_IncidentBasics";
import { Step2_SceneCondition } from "./Step2_SceneCondition";
import { Step3_FirePatterns } from "./Step3_FirePatterns";
import { Step4_Evidence } from "./Step4_Evidence";
import { Step5_OriginDetermination } from "./Step5_OriginDetermination";
import { Step6_CauseClassification } from "./Step6_CauseClassification";
import { Step7_FinalDetermination } from "./Step7_FinalDetermination";
import { Step8_ReviewSubmit } from "./Step8_ReviewSubmit";
import type { WizardState } from "@/types";

const STEPS = [
  { id: 1, label: "Incident Basics",       nfpa: "NFPA 921 §12" },
  { id: 2, label: "Scene Condition",        nfpa: "NFPA 921 §13" },
  { id: 3, label: "Fire Patterns",          nfpa: "NFPA 921 §6" },
  { id: 4, label: "Evidence",               nfpa: "NFPA 921 §15" },
  { id: 5, label: "Origin Determination",   nfpa: "NFPA 921 §14" },
  { id: 6, label: "Cause Classification",   nfpa: "NFPA 921 §20" },
  { id: 7, label: "Final Determination",    nfpa: "NFPA 921 §20" },
  { id: 8, label: "Review & Submit",        nfpa: "NFPA 921 §20" },
];

const defaultState: WizardState = {
  step: 1,
  incidentBasics: { incidentDate: "", dispatchTime: "", arrivalTime: "", address: "", city: "Perth", state: "WA", zip: "", occupancyType: "", notes: "" },
  sceneCondition: { structureType: "", numStories: "", constructionType: "", buildingAge: "", weatherConditions: "", windSpeed: "", windDirection: "", temperature: "", humidity: "", utilitiesGas: "UNKNOWN", utilitiesElectric: "UNKNOWN", utilitiesWater: "UNKNOWN" },
  firePatterns: [],
  evidence: [],
  originDetermination: { areaOfOrigin: "", pointOfOrigin: "", originNarrative: "", methodology: "" },
  causeClassification: { firstMaterialIgnited: "", ignitionSource: "", ignitionFactor: "", fuelPackage: "", fireSpread: "" },
  finalDetermination: { causeCode: "", causeNarrative: "", determination: "", recommendations: "" },
};

const DRAFT_KEY = "firetrace_wizard_draft";

function loadDraft(): WizardState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function WizardShell() {
  const router = useRouter();
  const [state, setState] = useState<WizardState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Restore draft from localStorage after hydration
  useEffect(() => {
    setState(loadDraft());
    setHydrated(true);
  }, []);

  // Persist draft on every state change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state, hydrated]);

  const currentStep = state.step;
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const hasDraft = hydrated && JSON.stringify(state) !== JSON.stringify(defaultState);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setState(defaultState);
  }, []);

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, STEPS.length) }));
  }

  function back() {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  }

  function goToStep(n: number) {
    setState((prev) => ({ ...prev, step: n }));
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create investigation");
      }
      const data = await res.json();
      localStorage.removeItem(DRAFT_KEY);
      router.push(`/investigations/${data.id}`);
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {hasDraft && (
        <div className="flex items-center justify-between bg-authority-50 border border-authority-200 rounded-lg px-4 py-2.5 text-sm">
          <span className="text-authority-800 font-medium">Draft restored — your previous progress has been loaded.</span>
          <button
            onClick={clearDraft}
            className="text-xs text-authority-600 hover:text-red-600 underline ml-4 transition-colors"
          >
            Clear draft
          </button>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
      {/* Step indicator — horizontal on mobile, vertical sidebar on desktop */}
      <div className="lg:w-56 lg:shrink-0 lg:py-2">
        {/* Mobile: horizontal step pills */}
        <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 -mx-1 px-1">
          {STEPS.map((step) => {
            const done = step.id < currentStep;
            const active = step.id === currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors shrink-0",
                  active ? "bg-authority-700 text-white border-authority-700" :
                  done  ? "bg-green-50 text-green-700 border-green-200" :
                          "bg-white text-slate-400 border-slate-200"
                )}
              >
                {done ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                {step.id}
              </button>
            );
          })}
        </div>

        {/* Desktop: vertical list */}
        <div className="hidden lg:block space-y-1">
          {STEPS.map((step) => {
            const done = step.id < currentStep;
            const active = step.id === currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                className={cn(
                  "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                  active ? "bg-authority-50" : "hover:bg-slate-50"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className={cn("w-4 h-4", active ? "text-authority-700" : "text-slate-300")} />
                  )}
                </div>
                <div>
                  <p className={cn(
                    "text-xs font-medium",
                    active ? "text-authority-800" : done ? "text-slate-600" : "text-slate-400"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{step.nfpa}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mt-4 px-3 hidden lg:block">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-authority-700 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
          {currentStep === 1 && (
            <Step1_IncidentBasics
              data={state.incidentBasics}
              onChange={(d) => update("incidentBasics", d)}
              onNext={next}
            />
          )}
          {currentStep === 2 && (
            <Step2_SceneCondition
              data={state.sceneCondition}
              onChange={(d) => update("sceneCondition", d)}
              onNext={next}
              onBack={back}
              incidentLat={state.incidentBasics.lat}
              incidentLng={state.incidentBasics.lng}
            />
          )}
          {currentStep === 3 && (
            <Step3_FirePatterns
              data={state.firePatterns}
              onChange={(d) => update("firePatterns", d)}
              onNext={next}
              onBack={back}
            />
          )}
          {currentStep === 4 && (
            <Step4_Evidence
              data={state.evidence}
              onChange={(d) => update("evidence", d)}
              onNext={next}
              onBack={back}
            />
          )}
          {currentStep === 5 && (
            <Step5_OriginDetermination
              data={state.originDetermination}
              onChange={(d) => update("originDetermination", d)}
              onNext={next}
              onBack={back}
            />
          )}
          {currentStep === 6 && (
            <Step6_CauseClassification
              data={state.causeClassification}
              onChange={(d) => update("causeClassification", d)}
              onNext={next}
              onBack={back}
            />
          )}
          {currentStep === 7 && (
            <Step7_FinalDetermination
              data={state.finalDetermination}
              onChange={(d) => update("finalDetermination", d)}
              onBack={back}
              onNext={next}
            />
          )}
          {currentStep === 8 && (
            <Step8_ReviewSubmit
              state={state}
              onBack={back}
              onSubmit={submit}
              submitting={submitting}
              error={error}
            />
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
