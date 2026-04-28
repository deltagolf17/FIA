"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { STRUCTURE_TYPES, CONSTRUCTION_TYPES } from "@/lib/nfpa/nfpa921";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SceneConditionData } from "@/types";
import { Info, Thermometer, Zap, Cloud, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  data: SceneConditionData;
  onChange: (d: SceneConditionData) => void;
  onNext: () => void;
  onBack: () => void;
  incidentLat?: number;
  incidentLng?: number;
}

const UTILITY_OPTIONS = [
  { value: "ON",      label: "On" },
  { value: "OFF",     label: "Off / Shut off" },
  { value: "UNKNOWN", label: "Unknown" },
];

const WIND_DIRECTIONS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];

export function Step2_SceneCondition({ data, onChange, onNext, onBack, incidentLat, incidentLng }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, getValues, setValue, watch } = useForm<any>({ defaultValues: data });

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherSource, setWeatherSource] = useState("");
  const [weatherError, setWeatherError] = useState("");

  const selectedWeather = watch("weatherConditions");
  const selectedWindDir = watch("windDirection");

  function handleNext() {
    onChange(getValues() as SceneConditionData);
    onNext();
  }

  async function autoFillWeather() {
    if (!incidentLat || !incidentLng) {
      setWeatherError("Geocode the address in Step 1 first to enable weather auto-fill.");
      return;
    }

    setWeatherLoading(true);
    setWeatherError("");
    setWeatherSource("");

    try {
      const res = await fetch(`/api/weather?lat=${incidentLat}&lng=${incidentLng}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Weather fetch failed");

      if (json.temperature != null) setValue("temperature", String(Math.round(json.temperature)));
      if (json.humidity != null)    setValue("humidity",    String(Math.round(json.humidity)));
      if (json.windSpeedKmh != null) setValue("windSpeed",  String(Math.round(json.windSpeedKmh)));
      if (json.windDirection)        setValue("windDirection", json.windDirection);
      if (json.conditions)           setValue("weatherConditions", json.conditions);

      setWeatherSource(
        `${json.station} (${json.distanceKm}km away) · ${json.source ?? "BOM"}`
      );
    } catch (e) {
      setWeatherError((e as Error).message);
    } finally {
      setWeatherLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 p-2">
      <div className="flex items-start gap-3 bg-authority-50 border border-authority-100 rounded-xl p-4">
        <Info className="w-4 h-4 text-authority-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-authority-800">NFPA 921 §13 — Scene Examination</p>
          <p className="text-xs text-authority-600 mt-0.5">Document structure type, weather, and utility status at time of fire. These factors directly influence fire behavior analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Structure Type</Label>
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

      {/* Weather — BOM auto-fill */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-fire-600" />
            Weather Conditions at Time of Fire
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={autoFillWeather}
            disabled={weatherLoading}
            className="gap-1.5 text-xs"
          >
            {weatherLoading
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <Cloud className="w-3 h-3" />
            }
            {weatherLoading ? "Fetching BOM…" : "Auto-fill from BOM"}
          </Button>
        </div>

        {weatherSource && (
          <div className="mb-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Weather filled from {weatherSource}
          </div>
        )}
        {weatherError && (
          <div className="mb-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {weatherError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Conditions</Label>
            <Select
              onValueChange={(v) => setValue("weatherConditions", v)}
              value={selectedWeather || data.weatherConditions || ""}
            >
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {["Clear","Partly Cloudy","Overcast","Rain","Snow","Fog","High Wind","Thunderstorm"].map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Temperature (°C)</Label>
            <Input type="number" placeholder="e.g. 32" {...register("temperature")} />
          </div>
          <div className="space-y-1.5">
            <Label>Wind Speed (km/h)</Label>
            <Input type="number" min="0" placeholder="e.g. 25" {...register("windSpeed")} />
          </div>
          <div className="space-y-1.5">
            <Label>Wind Direction</Label>
            <Select
              onValueChange={(v) => setValue("windDirection", v)}
              value={selectedWindDir || data.windDirection || ""}
            >
              <SelectTrigger><SelectValue placeholder="Direction..." /></SelectTrigger>
              <SelectContent>
                {WIND_DIRECTIONS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Humidity (%)</Label>
            <Input type="number" min="0" max="100" placeholder="e.g. 45" {...register("humidity")} />
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
            { key: "utilitiesGas" as const,      label: "Natural Gas",  icon: "🔥" },
            { key: "utilitiesElectric" as const,  label: "Electricity",  icon: "⚡" },
            { key: "utilitiesWater" as const,     label: "Water",        icon: "💧" },
          ].map(({ key, label, icon }) => (
            <div key={key} className="space-y-1.5">
              <Label>{icon} {label}</Label>
              <Select
                onValueChange={(v) => setValue(key, v as "ON" | "OFF" | "UNKNOWN")}
                defaultValue={data[key]}
              >
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
        <Button type="button" onClick={handleNext}>Continue — Fire Patterns</Button>
      </div>
    </form>
  );
}
