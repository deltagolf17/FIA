"use client";

import { useState, useEffect } from "react";
import type { LiveIncident, NearbyStation, DetailTab } from "@/types/incidents";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft, MapPin, Clock, Thermometer, Wind, Droplets,
  Radio, AlertTriangle, Activity, Navigation,
} from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  STRUCTURE_FIRE:  "bg-red-600",
  VEHICLE_FIRE:    "bg-orange-500",
  VEGETATION_FIRE: "bg-green-600",
  HAZMAT:          "bg-purple-600",
  RESCUE:          "bg-blue-600",
  ALARM:           "bg-yellow-600",
  OTHER:           "bg-slate-500",
};

const TYPE_LABELS: Record<string, string> = {
  STRUCTURE_FIRE:  "Structure Fire",
  VEHICLE_FIRE:    "Vehicle Fire",
  VEGETATION_FIRE: "Vegetation / Bush Fire",
  HAZMAT:          "Hazardous Materials",
  RESCUE:          "Rescue / Entrapment",
  ALARM:           "Alarm Activation",
  OTHER:           "Other Incident",
};

const FDR_COLORS: Record<string, string> = {
  "Catastrophic":         "bg-red-900 text-white",
  "Extreme":              "bg-red-700 text-white",
  "Severe":               "bg-orange-600 text-white",
  "Very High":            "bg-orange-400 text-white",
  "High":                 "bg-yellow-500 text-slate-900",
  "Moderate":             "bg-green-600 text-white",
  "Low-Moderate":         "bg-green-400 text-slate-900",
  "No Rating":            "bg-slate-200 text-slate-600",
};

function fdrColor(rating: string) {
  for (const [key, val] of Object.entries(FDR_COLORS)) {
    if (rating.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "bg-slate-200 text-slate-600";
}

function timeAgo(iso: string) {
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true }); }
  catch { return "—"; }
}

function WindDir({ deg, cardinal }: { deg: number | null; cardinal: string | null }) {
  if (deg == null) return <span className="text-slate-400">—</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <Navigation className="w-3 h-3" style={{ transform: `rotate(${deg}deg)` }} />
      {cardinal ?? `${deg}°`}
    </span>
  );
}

interface Props {
  incident: LiveIncident;
  onBack: () => void;
}

export function IncidentDetailPanel({ incident, onBack }: Props) {
  const [tab, setTab] = useState<DetailTab>("details");
  const [stations, setStations] = useState<NearbyStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== "weather" || !incident.lat || !incident.lon) return;
    setStationsLoading(true);
    setStationsError(null);
    fetch(`/api/weather/nearby?lat=${incident.lat}&lon=${incident.lon}`)
      .then((r) => r.json())
      .then((d) => {
        setStations(d.stations ?? []);
        if (d.error) setStationsError(d.error);
      })
      .catch(() => setStationsError("Failed to load weather data"))
      .finally(() => setStationsLoading(false));
  }, [tab, incident.lat, incident.lon]);

  const tabs: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: "details",  label: "Details",  icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: "weather",  label: "Weather",  icon: <Thermometer className="w-3.5 h-3.5" /> },
    { id: "channels", label: "Channels", icon: <Radio className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Back button */}
      <div className="px-4 pt-3 pb-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-fire-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to list
        </button>

        {/* Incident header */}
        <div className={`rounded-xl p-4 mb-3 ${TYPE_COLORS[incident.type] ?? "bg-slate-500"}`}>
          <div className="text-white/80 text-xs font-medium mb-1">
            {TYPE_LABELS[incident.type] ?? incident.rawType}
          </div>
          <div className="text-white font-bold text-lg leading-tight">
            {incident.suburb || incident.address || "Location TBC"}
          </div>
          {incident.lga && (
            <div className="text-white/70 text-xs mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {incident.lga}
            </div>
          )}
          <div className="text-white/70 text-xs mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeAgo(incident.startDate)}
          </div>
        </div>

        {/* FDR badge */}
        {incident.fdrRating && incident.fdrRating !== "No Rating" && (
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 ${fdrColor(incident.fdrRating)}`}>
            <Activity className="w-3.5 h-3.5" />
            FDR: {incident.fdrRating}
            {incident.fdrIndex != null && <span className="opacity-70">(Index: {incident.fdrIndex})</span>}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-200 px-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? "border-fire-500 text-fire-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── DETAILS TAB ── */}
        {tab === "details" && (
          <div className="p-4 space-y-4">
            <Section label="Incident Information">
              <Row label="Status" value={<StatusBadge status={incident.status} />} />
              <Row label="Type" value={incident.rawType} />
              <Row label="Started" value={new Date(incident.startDate).toLocaleString("en-AU")} />
              <Row label="Last Updated" value={new Date(incident.lastUpdated).toLocaleString("en-AU")} />
              {incident.fdrDistrict && <Row label="FDR District" value={incident.fdrDistrict} />}
            </Section>

            <Section label="Location">
              {incident.address && <Row label="Address" value={incident.address} />}
              {incident.suburb && <Row label="Suburb" value={incident.suburb} />}
              {incident.lga && <Row label="LGA" value={incident.lga} />}
              {incident.lat && incident.lon && (
                <Row
                  label="Coordinates"
                  value={`${incident.lat.toFixed(5)}, ${incident.lon.toFixed(5)}`}
                />
              )}
            </Section>

            {incident.description && (
              <Section label="Description">
                <p className="text-xs text-slate-600 leading-relaxed">{incident.description}</p>
              </Section>
            )}
          </div>
        )}

        {/* ── WEATHER TAB ── */}
        {tab === "weather" && (
          <div className="p-4">
            {!incident.lat || !incident.lon ? (
              <div className="text-center text-slate-400 text-sm py-8">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No coordinates — cannot fetch nearby weather
              </div>
            ) : stationsLoading ? (
              <div className="text-center text-slate-400 text-sm py-8 animate-pulse">
                Loading weather stations…
              </div>
            ) : stationsError ? (
              <div className="text-center text-slate-400 text-sm py-8">
                <p className="text-red-500 text-xs">{stationsError}</p>
                <p className="text-xs mt-1">Check DPIRD_API_KEY is configured</p>
              </div>
            ) : stations.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-8">No nearby stations found</div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 mb-3">
                  Nearest DPIRD weather stations to this incident
                </p>
                {stations.map((st) => (
                  <div key={st.stationCode} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-xs text-slate-800">{st.stationName}</div>
                        <div className="text-[10px] text-slate-400">{st.stationCode} · {st.distanceKm} km away</div>
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        {st.observedAt ? timeAgo(st.observedAt) : "—"}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <WeatherStat icon={<Thermometer className="w-3.5 h-3.5 text-orange-500" />} label="Temp" value={st.temperatureC != null ? `${st.temperatureC}°C` : "—"} />
                      <WeatherStat icon={<Droplets className="w-3.5 h-3.5 text-blue-500" />} label="Humidity" value={st.humidityPct != null ? `${st.humidityPct}%` : "—"} />
                      <WeatherStat icon={<Wind className="w-3.5 h-3.5 text-slate-500" />} label="Wind" value={st.windSpeedKmh != null ? `${st.windSpeedKmh} km/h` : "—"} />
                      <WeatherStat icon={<Navigation className="w-3.5 h-3.5 text-slate-500" />} label="Direction" value={<WindDir deg={st.windDirectionDegrees} cardinal={st.windDirectionCardinal} />} />
                      {st.windGustsKmh != null && (
                        <WeatherStat icon={<Wind className="w-3.5 h-3.5 text-red-400" />} label="Gusts" value={`${st.windGustsKmh} km/h`} />
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-slate-400 text-center mt-2">Source: DPIRD WA Agricultural Monitoring</p>
              </div>
            )}
          </div>
        )}

        {/* ── CHANNELS TAB ── */}
        {tab === "channels" && (
          <div className="p-4 space-y-3">
            <Section label="Emergency Radio Channels">
              <ChannelRow channel="Metro Fire Dispatch" freq="154.280 MHz" tg="TG 001" />
              <ChannelRow channel="WA Police Operations" freq="467.0375 MHz" tg="TG 102" />
              <ChannelRow channel="SES Coordination" freq="155.100 MHz" tg="TG 220" />
              <ChannelRow channel="DFES State Ops" freq="154.400 MHz" tg="TG 007" />
            </Section>
            <Section label="Useful Contacts">
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between"><span>Emergency WA</span><a href="https://www.emergency.wa.gov.au" target="_blank" rel="noopener noreferrer" className="text-fire-600 hover:underline">emergency.wa.gov.au</a></div>
                <div className="flex justify-between"><span>DFES Duty Officer</span><span className="font-mono">13 33 37</span></div>
                <div className="flex justify-between"><span>Police Assistance</span><span className="font-mono">131 444</span></div>
                <div className="flex justify-between"><span>Gas Emergency</span><span className="font-mono">13 13 52</span></div>
              </div>
            </Section>
            <p className="text-[10px] text-slate-400 text-center">
              Channel info is indicative only — verify with your agency before use
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{label}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <span className="text-xs text-slate-700 font-medium text-right">{value}</span>
    </div>
  );
}

function WeatherStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 bg-white rounded-lg px-2 py-1.5 border border-slate-100">
      {icon}
      <div>
        <div className="text-[9px] text-slate-400 uppercase tracking-wide leading-none">{label}</div>
        <div className="text-xs font-semibold text-slate-700 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function ChannelRow({ channel, freq, tg }: { channel: string; freq: string; tg: string }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-slate-50 last:border-0">
      <div>
        <div className="text-xs font-medium text-slate-700">{channel}</div>
        <div className="text-[10px] text-slate-400">{tg}</div>
      </div>
      <span className="text-xs font-mono text-fire-600">{freq}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-red-100 text-red-700",
    open:   "bg-orange-100 text-orange-700",
    closed: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
