"use client";

import { useForm } from "react-hook-form";
import { NFPA_CAUSE_CODES, getCauseCodeColor } from "@/lib/nfpa/nfpa921";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { DeterminationData } from "@/types";
import { CheckCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Props {
  data: DeterminationData;
  onChange: (d: DeterminationData) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Step7_FinalDetermination({ data, onChange, onBack, onNext }: Props) {
  const { register, getValues, watch, setValue } = useForm<DeterminationData>({ defaultValues: data });

  const selectedCode = watch("causeCode");

  function handleNext() {
    onChange(getValues());
    onNext();
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 p-2">
      <div className="flex items-start gap-3 bg-authority-50 border border-authority-100 rounded-xl p-4">
        <Shield className="w-4 h-4 text-authority-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-authority-800">NFPA 921 §20 — Final Cause Determination</p>
          <p className="text-xs text-authority-600 mt-0.5">Select the NFPA 921 cause classification supported by the evidence. This determination must be defensible and based on the scientific method.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>NFPA 921 Cause Classification</Label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(NFPA_CAUSE_CODES).map(([code, info]) => {
            const selected = selectedCode === code;
            const colorClass = getCauseCodeColor(code);
            return (
              <button
                key={code}
                type="button"
                onClick={() => setValue("causeCode", code as DeterminationData["causeCode"])}
                className={cn(
                  "text-left p-4 rounded-xl border-2 transition-all",
                  selected
                    ? "border-authority-700 bg-authority-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", colorClass)}>
                    {info.code}
                  </span>
                  {selected && <CheckCircle className="w-4 h-4 text-authority-700" />}
                </div>
                <p className="font-semibold text-sm text-slate-900">{info.label}</p>
                <p className="text-xs text-slate-500 mt-1">{info.description}</p>
                <p className="text-xs text-authority-600 mt-1.5">{info.nfpaSection}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Cause Narrative</Label>
        <Textarea
          rows={4}
          placeholder="Explain the basis for this cause classification. Reference the evidence, fire patterns, witness accounts, and how alternative hypotheses were eliminated per NFPA 921 §17.4..."
          {...register("causeNarrative")}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Determination Statement</Label>
        <Textarea
          rows={2}
          placeholder="The fire originated in [area] due to [cause]. The investigation determined the fire was [classification]..."
          {...register("determination")}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Recommendations</Label>
        <Textarea
          rows={2}
          placeholder="Safety recommendations, code violations noted, follow-up actions required..."
          {...register("recommendations")}
        />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="button" onClick={handleNext}>Review & Submit</Button>
      </div>
    </form>
  );
}
