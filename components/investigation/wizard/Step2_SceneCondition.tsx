"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sceneConditionSchema } from "@/lib/validations/investigation.schema";
import { STRUCTURE_TYPES, CONSTRUCTION_TYPES } from "@/lib/nfpa/nfpa921";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SceneConditionData } from "@/types";
import { Info, Thermometer, Zap } from "lucide-react";
import { z } from "zod";

type FormData = z.infer<typeof sceneConditionSchema>;

interface Props {
  data: SceneConditionData;
  onChange: (d: SceneConditionData) => void;
  onNext: () => void;
  onBack: () => void;
}

const UTILITY_OPTIONS = [
  { value: "ON",      label: "On" },
  { value: "OFF",     label: "Off / Shut off" },
  { value: "UNKNOWN", label: "Unknown" },
];

export function Step2_SceneCondition({ data, onChange, onNext, onBack }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(sceneConditionSchema),
    defaultValues: data,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onSubmit(values: any) {
    onChange(values as SceneConditionData);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-2">
      <div className="flex items-start gap-3 bg-authority-50 border border-authority-100 rounded-xl p-4">
        <Info className="w-4 h-4 text-authority-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-authority-800">NFPA 921 §13 — Scene Examination</p>
          <p className="text-xs text-authority-600 mt-0.5">Document structure type, weather, and utility status at time of fire. These factors directly influence fire behavior analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Structure Type <span className="text-red-500">*</span></Label>
          <Select onValueChange={(v) => setValue("structureType", v)} defaultValue={data.structureType}>
            <SelectTrigger>
              <SelectValue placeholder="Select structure type..." />
            </SelectTrigger>
            <SelectContent>
              {STRUCTURE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.structureType && <p className="text-xs text-red-500">{String(errors.structureType.message ?? "")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Construction Type</Label>
          <Select onValueChange={(v) => setValue("constructionType", v)} defaultValue={data.constructionType}>
            <SelectTrigger>
              <SelectValue placeholder="NFPA 220 type..." />
            </SelectTrigger>
            <SelectContent>
              {CONSTRUCTION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Number of Stories</Label>
          <Input type="number" min="1" max="200" {...register("numStories")} />
        </div>
        <div className="space-y-1.5">
          <Label>Building Age (years)</Label>
          <Input type="number" min="0" {...register("buildingAge")} />
        </div>
      </div>

      {/* Weather */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1.5">
          <Thermometer className="w-4 h-4 text-fire-600" />
          Weather Conditions at Time of Fire
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Conditions</Label>
            <Select onValueChange={(v) => setValue("weatherConditions", v)} defaultValue={data.weatherConditions}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {["Clear", "Partly Cloudy", "Overcast", "Rain", "Snow", "Fog", "High Wind", "Thunderstorm"].map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Temperature (°F)</Label>
            <Input type="number" {...register("temperature")} />
          </div>
          <div className="space-y-1.5">
            <Label>Wind Speed (mph)</Label>
            <Input type="number" min="0" {...register("windSpeed")} />
          </div>
          <div className="space-y-1.5">
            <Label>Wind Direction</Label>
            <Select onValueChange={(v) => setValue("windDirection", v)} defaultValue={data.windDirection}>
              <SelectTrigger><SelectValue placeholder="Direction..." /></SelectTrigger>
              <SelectContent>
                {["N","NE","E","SE","S","SW","W","NW"].map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Humidity (%)</Label>
            <Input type="number" min="0" max="100" {...register("humidity")} />
          </div>
        </div>
      </div>

      {/* Utilities */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-yellow-500" />
          Utilities Status at Time of Fire
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "utilitiesGas" as const, label: "Natural Gas", icon: "🔥" },
            { key: "utilitiesElectric" as const, label: "Electricity", icon: "⚡" },
            { key: "utilitiesWater" as const, label: "Water", icon: "💧" },
          ].map(({ key, label, icon }) => (
            <div key={key} className="space-y-1.5">
              <Label>{icon} {label}</Label>
              <Select onValueChange={(v) => setValue(key, v as "ON" | "OFF" | "UNKNOWN")} defaultValue={data[key]}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UTILITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="submit">Continue — Fire Patterns</Button>
      </div>
    </form>
  );
}
