"use client";

import { useForm } from "react-hook-form";
import { OCCUPANCY_TYPES } from "@/lib/nfpa/nfpa921";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { IncidentBasicsData } from "@/types";
import { Info } from "lucide-react";

interface Props {
  data: IncidentBasicsData;
  onChange: (d: IncidentBasicsData) => void;
  onNext: () => void;
}

export function Step1_IncidentBasics({ data, onChange, onNext }: Props) {
  const { register, getValues, setValue } = useForm<IncidentBasicsData>({
    defaultValues: data,
  });

  function handleNext() {
    onChange(getValues());
    onNext();
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 p-2">
      <div className="flex items-start gap-3 bg-authority-50 border border-authority-100 rounded-xl p-4">
        <Info className="w-4 h-4 text-authority-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-authority-800">NFPA 921 §12 — Scene Documentation</p>
          <p className="text-xs text-authority-600 mt-0.5">Record complete incident information as received from dispatch. Accurate times are critical for fire progression analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="incidentDate">Incident Date <span className="text-red-500">*</span></Label>
          <Input id="incidentDate" type="date" {...register("incidentDate")} />
                  </div>
        <div className="space-y-1.5">
          <Label htmlFor="occupancyType">Occupancy Type <span className="text-red-500">*</span></Label>
          <Select onValueChange={(v) => setValue("occupancyType", v)} defaultValue={data.occupancyType}>
            <SelectTrigger>
              <SelectValue placeholder="Select occupancy..." />
            </SelectTrigger>
            <SelectContent>
              {OCCUPANCY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
                  </div>
        <div className="space-y-1.5">
          <Label htmlFor="dispatchTime">Dispatch Time</Label>
          <Input id="dispatchTime" type="time" {...register("dispatchTime")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="arrivalTime">Arrival Time</Label>
          <Input id="arrivalTime" type="time" {...register("arrivalTime")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
        <Input id="address" placeholder="123 Main Street" {...register("address")} />
              </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-1.5">
          <Label>City <span className="text-red-500">*</span></Label>
          <Input placeholder="Springfield" {...register("city")} />
                  </div>
        <div className="space-y-1.5">
          <Label>State <span className="text-red-500">*</span></Label>
          <Input placeholder="IL" maxLength={2} className="uppercase" {...register("state")} />
                  </div>
        <div className="space-y-1.5">
          <Label>ZIP Code <span className="text-red-500">*</span></Label>
          <Input placeholder="62701" {...register("zip")} />
                  </div>
      </div>

      <div className="space-y-1.5">
        <Label>Initial Notes</Label>
        <Textarea placeholder="Dispatch notes, initial observations from first responders..." rows={3} {...register("notes")} />
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleNext}>Continue — Scene Condition</Button>
      </div>
    </form>
  );
}
