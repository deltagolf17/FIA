"use client";

import { useState } from "react";
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
import type { WizardState } from "@/types";

const STEPS = [
  { id: 1, label: "Incident Basics",       nfpa: "NFPA 921 §12" },
  { id: 2, label: "Scene Condition",        nfpa: "NFPA 921 §13" },
  { id: 3, label: "Fire Patterns",          nfpa: "NFPA 921 §6" },
  { id: 4, label: "Evidence",               nfpa: "NFPA 921 §15" },
  { id: 5, label: "Origin Determination",   nfpa: "NFPA 921 §14" },
  { id: 6, label: "Cause Classification",   nfpa: "NFPA 921 §20" },
  { id: 7, label: "Final Determination",    nfpa: "NFPA 921 §20" },
];

const defaultState: WizardState = {
  step: 1,
  incidentBasics: { incidentDate: "", dispatchTime: "", arrivalTime: "", address: "", city: "", state: "", zip: "", occupancyType: "", notes: "" },
  sceneCondition: { structureType: "", numStories: "", constructionType: "", buildingAge: "", weatherConditions: "", windSpeed: "", windDirection: "", temperature: "", humidity: "", utilitiesGas: "UNKNOWN", utilitiesElectric: "UNKNOWN", utilitiesWater: "UNKNOWN" },
  firePatterns: [],
  evidence: [],
  originDetermination: { areaOfOrigin: "", pointOfOrigin: "", originNarrative: "", methodology: "" },
  causeClassification: { firstMaterialIgnited: "", ignitionSource: "", ignitionFactor: "", fuelPackage: "", fireSpread: "" },
  finalDetermination: { causeCode: "", causeNarrative: "", determination: "", recommendations: "" },
};

export function WizardShell() {
  const router = useRouter();
  const [state, setState] = useState<WizardState>(defaultState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentStep = state.step;
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, STEPS.length) }));
  }

  function back() {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
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
      router.push(`/investigations/${data.id}`);
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Step sidebar */}
      <div className="w-56 shrink-0 py-2">
        <div className="space-y-1">
          {STEPS.map((step) => {
            const done = step.id < currentStep;
            const active = step.id === currentStep;
            return (
              <div key={step.id} className={cn(
                "flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors",
                active ? "bg-authority-50" : "hover:bg-slate-50"
              )}>
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
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mt-4 px-3">
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
              onSubmit={submit}
              submitting={submitting}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
