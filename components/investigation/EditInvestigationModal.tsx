"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

const STRUCTURE_TYPES = [
  "RESIDENTIAL_SINGLE", "RESIDENTIAL_MULTI", "COMMERCIAL",
  "INDUSTRIAL", "VEHICLE", "WILDLAND", "OTHER",
];
const CONSTRUCTION_TYPES = ["TYPE_I", "TYPE_II", "TYPE_III", "TYPE_IV", "TYPE_V", "UNKNOWN"];
const UTILITY_STATES    = ["ON", "OFF", "UNKNOWN"];
const CAUSE_CODES       = ["ACCIDENTAL", "NATURAL", "INCENDIARY", "UNDETERMINED"];
const WIND_DIRECTIONS   = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

interface Investigation {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  incidentDate: Date | string;
  structureType: string | null;
  occupancyType: string | null;
  constructionType: string | null;
  buildingAge: number | null;
  numStories: number | null;
  weatherConditions: string | null;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: string | null;
  utilitiesGas: string | null;
  utilitiesElectric: string | null;
  utilitiesWater: string | null;
  areaOfOrigin: string | null;
  pointOfOrigin: string | null;
  causeCode: string | null;
  causeNarrative: string | null;
  firstMaterialIgnited: string | null;
  ignitionSource: string | null;
  ignitionFactor: string | null;
  fuelPackage: string | null;
  fireSpread: string | null;
  determination: string | null;
}

interface Props {
  investigation: Investigation;
  onClose: () => void;
}

const sel = "w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-authority-500";
const ta  = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-authority-500 resize-none";

function toDateInput(v: Date | string): string {
  const d = typeof v === "string" ? new Date(v) : v;
  return d.toISOString().slice(0, 10);
}

function buildInitial(inv: Investigation) {
  return {
    address:             inv.address,
    city:                inv.city,
    state:               inv.state,
    zip:                 inv.zip,
    incidentDate:        toDateInput(inv.incidentDate),
    structureType:       inv.structureType       ?? "",
    occupancyType:       inv.occupancyType       ?? "",
    constructionType:    inv.constructionType    ?? "",
    buildingAge:         inv.buildingAge  != null ? String(inv.buildingAge)  : "",
    numStories:          inv.numStories   != null ? String(inv.numStories)   : "",
    weatherConditions:   inv.weatherConditions   ?? "",
    temperature:         inv.temperature  != null ? String(inv.temperature)  : "",
    humidity:            inv.humidity     != null ? String(inv.humidity)     : "",
    windSpeed:           inv.windSpeed    != null ? String(inv.windSpeed)    : "",
    windDirection:       inv.windDirection        ?? "",
    utilitiesGas:        inv.utilitiesGas         ?? "UNKNOWN",
    utilitiesElectric:   inv.utilitiesElectric    ?? "UNKNOWN",
    utilitiesWater:      inv.utilitiesWater        ?? "UNKNOWN",
    areaOfOrigin:        inv.areaOfOrigin          ?? "",
    pointOfOrigin:       inv.pointOfOrigin         ?? "",
    causeCode:           inv.causeCode             ?? "",
    firstMaterialIgnited:inv.firstMaterialIgnited  ?? "",
    ignitionSource:      inv.ignitionSource        ?? "",
    ignitionFactor:      inv.ignitionFactor        ?? "",
    fuelPackage:         inv.fuelPackage           ?? "",
    fireSpread:          inv.fireSpread            ?? "",
    causeNarrative:      inv.causeNarrative        ?? "",
    determination:       inv.determination         ?? "",
  };
}

type Tab = "scene" | "cause";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "scene", label: "Scene & Location", icon: "📍" },
  { id: "cause", label: "Origin & Cause",   icon: "🔥" },
];

export function EditInvestigationModal({ investigation: inv, onClose }: Props) {
  const router = useRouter();
  const [tab, setTab]       = useState<Tab>("scene");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [form, setForm]     = useState(() => buildInitial(inv));

  const isDirty = JSON.stringify(form) !== JSON.stringify(buildInitial(inv));

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleClose() {
    if (isDirty && !confirm("You have unsaved changes. Discard them?")) return;
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.address.trim() || !form.city.trim() || !form.state.trim()) {
      setError("Address, city, and state are required.");
      setTab("scene");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        address:             form.address.trim(),
        city:                form.city.trim(),
        state:               form.state.trim(),
        zip:                 form.zip.trim(),
        incidentDate:        new Date(form.incidentDate).toISOString(),
        structureType:       form.structureType    || null,
        occupancyType:       form.occupancyType    || null,
        constructionType:    form.constructionType || null,
        buildingAge:         form.buildingAge  ? Number(form.buildingAge)  : null,
        numStories:          form.numStories   ? Number(form.numStories)   : null,
        weatherConditions:   form.weatherConditions || null,
        temperature:         form.temperature ? Number(form.temperature) : null,
        humidity:            form.humidity    ? Number(form.humidity)    : null,
        windSpeed:           form.windSpeed   ? Number(form.windSpeed)   : null,
        windDirection:       form.windDirection || null,
        utilitiesGas:        form.utilitiesGas,
        utilitiesElectric:   form.utilitiesElectric,
        utilitiesWater:      form.utilitiesWater,
        areaOfOrigin:        form.areaOfOrigin        || null,
        pointOfOrigin:       form.pointOfOrigin       || null,
        causeCode:           form.causeCode           || null,
        firstMaterialIgnited:form.firstMaterialIgnited || null,
        ignitionSource:      form.ignitionSource      || null,
        ignitionFactor:      form.ignitionFactor      || null,
        fuelPackage:         form.fuelPackage         || null,
        fireSpread:          form.fireSpread          || null,
        causeNarrative:      form.causeNarrative      || null,
        determination:       form.determination       || null,
      };

      const res = await fetch(`/api/investigations/${inv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save changes.");
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900">Edit Investigation Details</h2>
            {isDirty && <p className="text-xs text-amber-600 mt-0.5">Unsaved changes</p>}
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-100 px-6 shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-1 py-3 text-sm font-medium border-b-2 mr-6 transition-colors",
                tab === t.id
                  ? "border-authority-700 text-authority-800"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            {/* ─── SCENE & LOCATION TAB ─── */}
            {tab === "scene" && (
              <>
                <section>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Incident</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="address">Address *</Label>
                      <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="state">State *</Label>
                        <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} required maxLength={2} className="uppercase" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="zip">Postcode</Label>
                        <Input id="zip" value={form.zip} onChange={(e) => set("zip", e.target.value)} maxLength={4} inputMode="numeric" pattern="[0-9]{4}" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="incidentDate">Incident Date *</Label>
                      <input id="incidentDate" type="date" value={form.incidentDate} onChange={(e) => set("incidentDate", e.target.value)} className={sel} required />
                    </div>
                  </div>
                </section>

                <section>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Structure</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Structure Type</Label>
                      <select value={form.structureType} onChange={(e) => set("structureType", e.target.value)} className={sel}>
                        <option value="">— Select —</option>
                        {STRUCTURE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="occupancyType">Occupancy Type</Label>
                      <Input id="occupancyType" value={form.occupancyType} onChange={(e) => set("occupancyType", e.target.value)} placeholder="e.g. Residential (1-2 family)" />
                    </div>
                    <div className="space-y-1">
                      <Label>Construction Type</Label>
                      <select value={form.constructionType} onChange={(e) => set("constructionType", e.target.value)} className={sel}>
                        <option value="">— Select —</option>
                        {CONSTRUCTION_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="buildingAge">Age (yrs)</Label>
                        <Input id="buildingAge" type="number" min="0" value={form.buildingAge} onChange={(e) => set("buildingAge", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="numStories">Stories</Label>
                        <Input id="numStories" type="number" min="1" value={form.numStories} onChange={(e) => set("numStories", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Weather Conditions — NFPA 921 §13.5</p>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="weatherConditions">Conditions</Label>
                      <Input id="weatherConditions" value={form.weatherConditions} onChange={(e) => set("weatherConditions", e.target.value)} placeholder="e.g. Clear, Overcast, Rain" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="temperature">Temp (°C)</Label>
                      <Input id="temperature" type="number" value={form.temperature} onChange={(e) => set("temperature", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="humidity">Humidity (%)</Label>
                      <Input id="humidity" type="number" min="0" max="100" value={form.humidity} onChange={(e) => set("humidity", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="windSpeed">Wind Speed (km/h)</Label>
                      <Input id="windSpeed" type="number" min="0" value={form.windSpeed} onChange={(e) => set("windSpeed", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Wind Direction</Label>
                      <select value={form.windDirection} onChange={(e) => set("windDirection", e.target.value)} className={sel}>
                        <option value="">— Select —</option>
                        {WIND_DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </section>

                <section>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Utilities at Time of Fire</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(["utilitiesGas", "utilitiesElectric", "utilitiesWater"] as const).map((key) => (
                      <div key={key} className="space-y-1">
                        <Label>{key.replace("utilities", "")}</Label>
                        <select value={form[key]} onChange={(e) => set(key, e.target.value)} className={sel}>
                          {UTILITY_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* ─── ORIGIN & CAUSE TAB ─── */}
            {tab === "cause" && (
              <>
                <section>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Origin Determination — NFPA 921 §14</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="areaOfOrigin">Area of Origin</Label>
                      <Input id="areaOfOrigin" value={form.areaOfOrigin} onChange={(e) => set("areaOfOrigin", e.target.value)} placeholder="e.g. Kitchen, Basement" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pointOfOrigin">Point of Origin</Label>
                      <Input id="pointOfOrigin" value={form.pointOfOrigin} onChange={(e) => set("pointOfOrigin", e.target.value)} placeholder="e.g. Range/Stove surface" />
                    </div>
                  </div>
                </section>

                <section>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Cause Classification — NFPA 921 §20</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>NFPA 921 Cause Code</Label>
                      <select value={form.causeCode} onChange={(e) => set("causeCode", e.target.value)} className={sel}>
                        <option value="">— Pending —</option>
                        {CAUSE_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="firstMaterialIgnited">First Material Ignited</Label>
                      <Input id="firstMaterialIgnited" value={form.firstMaterialIgnited} onChange={(e) => set("firstMaterialIgnited", e.target.value)} placeholder="e.g. Cooking materials" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ignitionSource">Ignition Source</Label>
                      <Input id="ignitionSource" value={form.ignitionSource} onChange={(e) => set("ignitionSource", e.target.value)} placeholder="e.g. Open flame" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ignitionFactor">Ignition Factor</Label>
                      <Input id="ignitionFactor" value={form.ignitionFactor} onChange={(e) => set("ignitionFactor", e.target.value)} placeholder="e.g. Misuse of ignition source" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="fuelPackage">Fuel Package</Label>
                      <Input id="fuelPackage" value={form.fuelPackage} onChange={(e) => set("fuelPackage", e.target.value)} placeholder="e.g. Cooking oils, wood cabinets" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="fireSpread">Fire Spread</Label>
                      <Input id="fireSpread" value={form.fireSpread} onChange={(e) => set("fireSpread", e.target.value)} placeholder="e.g. Flame spread to adjacent materials" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="causeNarrative">Cause Narrative</Label>
                      <textarea
                        id="causeNarrative"
                        value={form.causeNarrative}
                        onChange={(e) => set("causeNarrative", e.target.value)}
                        rows={4}
                        className={ta}
                        placeholder="Detailed description of fire cause and progression per NFPA 921 §20..."
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Final Determination</p>
                  <textarea
                    value={form.determination}
                    onChange={(e) => set("determination", e.target.value)}
                    rows={4}
                    className={ta}
                    placeholder="Final determination statement per NFPA 921 §20..."
                  />
                </section>
              </>
            )}
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-authority-700 hover:bg-authority-800 gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
