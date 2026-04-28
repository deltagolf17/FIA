"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import type { NearbyStation, WeatherMapMode } from "@/types/incidents";
import { Thermometer, Wind, Layers, RefreshCw, Navigation } from "lucide-react";

const WA_CENTER = { lat: -25.5, lng: 122.0 };

// Colour scale for temperature: blue (cold) → green → yellow → red (hot)
function tempToColor(c: number | null): string {
  if (c == null) return "#94A3B8";
  if (c < 10) return "#60A5FA";
  if (c < 20) return "#34D399";
  if (c < 30) return "#FCD34D";
  if (c < 38) return "#F97316";
  return "#DC2626";
}

// Colour scale for wind speed
function windToColor(kmh: number | null): string {
  if (kmh == null) return "#94A3B8";
  if (kmh < 15) return "#34D399";
  if (kmh < 30) return "#FCD34D";
  if (kmh < 50) return "#F97316";
  if (kmh < 70) return "#DC2626";
  return "#7C3AED";
}

function makeCircleIcon(color: string, scale = 14): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.85,
    strokeColor: "#fff",
    strokeWeight: 2,
    scale,
  };
}

interface StationData {
  code: string;
  name: string;
  lat: number;
  lon: number;
  temperatureC: number | null;
  humidityPct: number | null;
  windSpeedKmh: number | null;
  windDirectionCardinal: string | null;
  windGustsKmh: number | null;
  fetchedAt: string | null;
}

export function WeatherMapShell() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const [mode, setMode] = useState<WeatherMapMode>("temperature");
  const [stationData, setStationData] = useState<StationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [selected, setSelected] = useState<StationData | null>(null);
  const [satellite, setSatellite] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/weather/all-stations");
      const data = await res.json();
      setFetchedAt(data.fetchedAt ?? null);
      const mapped: StationData[] = (data.stations ?? []).map(
        (st: {
          code: string; name: string; lat: number; lon: number;
          temperatureC: number | null; humidityPct: number | null;
          windSpeedKmh: number | null; windDirectionCardinal: string | null;
          windGustsKmh: number | null; observedAt: string | null;
        }) => ({
          code: st.code,
          name: st.name,
          lat: st.lat,
          lon: st.lon,
          temperatureC: st.temperatureC,
          humidityPct: st.humidityPct,
          windSpeedKmh: st.windSpeedKmh,
          windDirectionCardinal: st.windDirectionCardinal,
          windGustsKmh: st.windGustsKmh,
          fetchedAt: st.observedAt,
        })
      );
      setStationData(mapped);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 300_000); // every 5 min
    return () => clearInterval(interval);
  }, [fetchWeather]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400 text-sm animate-pulse">
        Loading map…
      </div>
    );
  }

  const getColor = (st: StationData) =>
    mode === "temperature" ? tempToColor(st.temperatureC) : windToColor(st.windSpeedKmh);

  const getLabel = (st: StationData) => {
    if (mode === "temperature") return st.temperatureC != null ? `${st.temperatureC}°` : "—";
    return st.windSpeedKmh != null ? `${st.windSpeedKmh}` : "—";
  };

  return (
    <div className="relative w-full h-[calc(100vh-0px)]">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={WA_CENTER}
        zoom={6}
        onLoad={(map) => { mapRef.current = map; }}
        options={{
          mapTypeId: satellite ? "satellite" : "roadmap",
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {stationData.map((st) => (
          <Marker
            key={st.code}
            position={{ lat: st.lat, lng: st.lon }}
            icon={makeCircleIcon(getColor(st), selected?.code === st.code ? 18 : 13)}
            label={{
              text: getLabel(st),
              color: "#fff",
              fontSize: "10px",
              fontWeight: "700",
            }}
            onClick={() => setSelected(st)}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lon }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="text-xs min-w-[160px]">
              <div className="font-bold text-slate-800 mb-2">{selected.name}</div>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between gap-4">
                  <span>Temperature</span>
                  <span className="font-semibold">{selected.temperatureC != null ? `${selected.temperatureC}°C` : "—"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Humidity</span>
                  <span className="font-semibold">{selected.humidityPct != null ? `${selected.humidityPct}%` : "—"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Wind</span>
                  <span className="font-semibold">
                    {selected.windSpeedKmh != null ? `${selected.windSpeedKmh} km/h` : "—"}
                    {selected.windDirectionCardinal ? ` ${selected.windDirectionCardinal}` : ""}
                  </span>
                </div>
                {selected.windGustsKmh != null && (
                  <div className="flex justify-between gap-4">
                    <span>Gusts</span>
                    <span className="font-semibold text-red-600">{selected.windGustsKmh} km/h</span>
                  </div>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Top bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex overflow-hidden">
          <button
            onClick={() => setMode("temperature")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors ${
              mode === "temperature" ? "bg-fire-600 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            Temperature
          </button>
          <button
            onClick={() => setMode("wind")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors border-l border-slate-200 ${
              mode === "wind" ? "bg-fire-600 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            Wind Speed
          </button>
        </div>
      </div>

      {/* Controls top-right */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => setSatellite((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Layers className="w-3.5 h-3.5" />
          {satellite ? "Streets" : "Satellite"}
        </button>
        <button
          onClick={() => mapRef.current?.panTo(WA_CENTER)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          WA
        </button>
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 bg-white/95 rounded-xl shadow-lg border border-slate-200 px-4 py-3 z-10">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
          {mode === "temperature" ? "Temperature (°C)" : "Wind Speed (km/h)"}
        </div>
        {mode === "temperature" ? (
          <div className="space-y-1">
            {[
              { color: "#60A5FA", label: "< 10°C" },
              { color: "#34D399", label: "10–20°C" },
              { color: "#FCD34D", label: "20–30°C" },
              { color: "#F97316", label: "30–38°C" },
              { color: "#DC2626", label: "> 38°C" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {[
              { color: "#34D399", label: "< 15 km/h" },
              { color: "#FCD34D", label: "15–30 km/h" },
              { color: "#F97316", label: "30–50 km/h" },
              { color: "#DC2626", label: "50–70 km/h" },
              { color: "#7C3AED", label: "> 70 km/h" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status pill */}
      <div className="absolute bottom-6 right-4 bg-white/95 rounded-full shadow-md border border-slate-200 px-3 py-1 z-10 text-[10px] text-slate-500 font-medium">
        {loading ? "Updating…" : fetchedAt ? `Updated ${new Date(fetchedAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}` : "—"}
        {" · "}Source: DPIRD WA
      </div>
    </div>
  );
}
