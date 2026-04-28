"use client";

import { useForm } from "react-hook-form";
import { IGNITION_SOURCES, FIRST_MATERIALS } from "@/lib/nfpa/nfpa921";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CauseData } from "@/types";
import { Info, Zap } from "lucide-react";

interface Props {
  data: CauseData;
  onChange: (d: CauseData) => void;
  onNext: () => void;
  onBack: () => void;
}

const IGNITION_FACTORS = [
  "Heat of open flame",
  "Electrical malfunction",
  "Mechanical sparks",
  "Spontaneous ignition",
  "Misuse of ignition source",
  "Abandoned material",
  "Intentional ignition",
  "Natural ignition (lightning)",
  "Unknown",
];

export function Step6_CauseClassification({ data, onChange, onNext, onBack }: Props) {
  const { register, getValues, setValue } = useForm<CauseData>({ defaultValues: data });

  function handleNext() {
    onChange(getValues());
    onNext();
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 p-2">
      <div className="flex items-start gap-3 bg-authority-50 border border-authority-100 rounded-xl p-4">
        <Info className="w-4 h-4 text-authority-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-authority-800">NFPA 921 §20.1 — Fire Cause Analysis</p>
          <p className="text-xs text-authority-600 mt-0.5">
            Cause = First material ignited + Ignition source + Ignition factor. All three elements must be identified or the cause is classified as Undetermined.
          </p>
        </div>
      </div>

      <div className="p-4 bg-fire-50 border border-fire-100 rounded-xl">
        <p className="text-xs font-semibold text-fire-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          Fire Cause Triangle — NFPA 921 §20.1
        </p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-fire-700">
          <div className="bg-white border border-fire-200 rounded-lg p-2 font-medium">1st Material Ignited</div>
          <div className="bg-white border border-fire-200 rounded-lg p-2 font-medium">Ignition Source</div>
          <div className="bg-white border border-fire-200 rounded-lg p-2 font-medium">Ignition Factor</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label>First Material Ignited</Label>
          <Select onValueChange={(v) => setValue("firstMaterialIgnited", v)} defaultValue={data.firstMaterialIgnited}>
            <SelectTrigger><SelectValue placeholder="Select first material..." /></SelectTrigger>
            <SelectContent>
              {FIRST_MATERIALS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Ignition Source</Label>
          <Select onValueChange={(v) => setValue("ignitionSource", v)} defaultValue={data.ignitionSource}>
            <SelectTrigger><SelectValue placeholder="Select ignition source..." /></SelectTrigger>
            <SelectContent>
              {IGNITION_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Ignition Factor</Label>
          <Select onValueChange={(v) => setValue("ignitionFactor", v)} defaultValue={data.ignitionFactor}>
            <SelectTrigger><SelectValue placeholder="Select ignition factor..." /></SelectTrigger>
            <SelectContent>
              {IGNITION_FACTORS.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Fuel Package</Label>
          <Input placeholder="Describe the fuel arrangement at origin..." {...register("fuelPackage")} />
        </div>

        <div className="space-y-1.5">
          <Label>Fire Spread</Label>
          <Input placeholder="How did fire spread from origin? Vertical, horizontal, through voids..." {...register("fireSpread")} />
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="button" onClick={handleNext}>Continue — Final Determination</Button>
      </div>
    </form>
  );
}
