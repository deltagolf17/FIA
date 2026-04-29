"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { OCCUPANCY_TYPES } from "@/lib/nfpa/nfpa921";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { IncidentBasicsData } from "@/types";
import { Info, MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  data: IncidentBasicsData;
  onChange: (d: IncidentBasicsData) => void;
  onNext: () => void;
}

export function Step1_IncidentBasics({ data, onChange, onNext }: Props) {
  const { register, getValues, setValue, watch } = useForm<IncidentBasicsData>({
    defaultValues: data,
  });

  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<{ lat: number; lng: number; match: string } | null>(
    data.lat && data.lng ? { lat: data.lat, lng: data.lng, match: `${data.address}, ${data.city}` } : null
  );
  const [geocodeError, setGeocodeError] = useState("");

  const address = watch("address");
  const city = watch("city");
  const state = watch("state");

  async function geocodeAddress() {
    const fullAddress = [address, city, state, "WA", "Australia"].filter(Boolean).join(", ");
    if (!fullAddress.trim()) return;

    setGeocoding(true);
    setGeocodeError("");
    setGeocodeResult(null);

    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(fullAddress)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Geocode failed");
      setGeocodeResult({ lat: json.lat, lng: json.lng, match: json.matchAddress });
      setValue("lat", json.lat);
      setValue("lng", json.lng);
    } catch (e) {
      setGeocodeError((e as Error).message);
    } finally {
      setGeocoding(false);
    }
  }

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
          <Label htmlFor="occupancyType">Occupancy Type</Label>
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
        <Input id="address" placeholder="123 Stirling Highway" {...register("address")} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-1.5">
          <Label>City <span className="text-red-500">*</span></Label>
          <Input placeholder="Perth" {...register("city")} />
        </div>
        <div className="space-y-1.5">
          <Label>State <span className="text-red-500">*</span></Label>
          <Input placeholder="WA" maxLength={2} className="uppercase" {...register("state")} />
        </div>
        <div className="space-y-1.5">
          <Label>Postcode</Label>
          <Input placeholder="6000" maxLength={4} inputMode="numeric" pattern="[0-9]{4}" {...register("zip")} />
        </div>
      </div>

      {/* Landgate Geocoder */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-authority-600" />
              Landgate WA — Address Geocoding
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Pinpoints the incident on the map using the WA SLIP Geocoder</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={geocodeAddress}
            disabled={geocoding || !address}
            className="gap-1.5 shrink-0"
          >
            {geocoding
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <MapPin className="w-3.5 h-3.5" />
            }
            {geocoding ? "Locating…" : "Get Coordinates"}
          </Button>
        </div>

        {geocodeResult && (
          <div className="flex items-start gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Located: </span>{geocodeResult.match}
              <span className="text-green-600 ml-2 font-mono">
                {geocodeResult.lat.toFixed(5)}, {geocodeResult.lng.toFixed(5)}
              </span>
            </div>
          </div>
        )}

        {geocodeError && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {geocodeError} — coordinates can be added later
          </div>
        )}
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
