"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OriginData } from "@/types";
import { Info, MapPin } from "lucide-react";

interface Props {
  data: OriginData;
  onChange: (d: OriginData) => void;
  onNext: () => void;
  onBack: () => void;
}

const METHODOLOGIES = [
  "Systematic scene examination",
  "Fire pattern analysis",
  "Physical evidence analysis",
  "Witness statements",
  "Video/photo analysis",
  "Arc mapping",
  "Computer fire modeling",
  "Combination of methods",
];

export function Step5_OriginDetermination({ data, onChange, onNext, onBack }: Props) {
  const { register, getValues, setValue } = useForm<OriginData>({ defaultValues: data });

  function handleNext() {
    onChange(getValues());
    onNext();
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 p-2">
      <div className="flex items-start gap-3 bg-authority-50 border border-authority-100 rounded-xl p-4">
        <Info className="w-4 h-4 text-authority-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-authority-800">NFPA 921 §14 — Origin Determination</p>
          <p className="text-xs text-authority-600 mt-0.5">Identify the area and point of origin using systematic fire pattern analysis. The origin is determined by evaluating fire patterns, char depth, and witness accounts — not by assumption.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="areaOfOrigin">
            Area of Origin
            <span className="ml-2 text-xs text-slate-400 font-normal">NFPA 921 §14.3</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="areaOfOrigin"
              className="pl-9"
              placeholder="e.g., Kitchen, northwest corner of structure"
              {...register("areaOfOrigin")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pointOfOrigin">
            Point of Origin
            <span className="ml-2 text-xs text-slate-400 font-normal">NFPA 921 §14.4</span>
          </Label>
          <Input
            id="pointOfOrigin"
            placeholder="e.g., Lower cabinet adjacent to range, floor level"
            {...register("pointOfOrigin")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Investigative Methodology</Label>
          <Select onValueChange={(v) => setValue("methodology", v)} defaultValue={data.methodology}>
            <SelectTrigger><SelectValue placeholder="Select methodology used..." /></SelectTrigger>
            <SelectContent>
              {METHODOLOGIES.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="originNarrative">Origin Determination Narrative</Label>
          <Textarea
            id="originNarrative"
            rows={5}
            placeholder="Describe the fire pattern analysis that supports this origin determination. Reference specific patterns documented in Step 3. Include how alternative hypotheses were considered and eliminated per NFPA 921 §17.4..."
            {...register("originNarrative")}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="button" onClick={handleNext}>Continue — Cause Classification</Button>
      </div>
    </form>
  );
}
