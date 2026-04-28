"use client";

import { useCallback, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import type { LiveIncident } from "@/types/incidents";
import { Layers, Navigation } from "lucide-react";

const WA_CENTER = { lat: -25.5, lng: 122.0 };
const DEFAULT_ZOOM = 6;

const INCIDENT_COLORS: Record<string, string> = {
  STRUCTURE_FIRE:  "#DC2626",
  VEHICLE_FIRE:    "#F97316",
  VEGETATION_FIRE: "#16A34A",
  HAZMAT:          "#7C3AED",
  RESCUE:          "#2563EB",
  ALARM:           "#CA8A04",
  OTHER:           "#6B7280",
};

const INCIDENT_LABELS: Record<string, string> = {
  STRUCTURE_FIRE:  "Structure Fire",
  VEHICLE_FIRE:    "Vehicle Fire",
  VEGETATION_FIRE: "Vegetation Fire",
  HAZMAT:          "HazMat",
  RESCUE:          "Rescue",
  ALARM:           "Alarm",
  OTHER:           "Other",
};

function makeMarkerIcon(color: string, active: boolean): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: active ? 1 : 0.55,
    strokeColor: "#fff",
    strokeWeight: active ? 2.5 : 1.5,
    scale: active ? 11 : 8,
  };
}

interface Props {
  incidents: LiveIncident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function IncidentMap({ incidents, selectedId, onSelect }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [satellite, setSatellite] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const mapped = incidents.filter((i) => i.lat !== null && i.lon !== null);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-500 animate-pulse">Loading map…</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={WA_CENTER}
        zoom={DEFAULT_ZOOM}
        onLoad={onLoad}
        options={{
          mapTypeId: satellite ? "satellite" : "roadmap",
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          styles: satellite ? [] : [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        }}
      >
        {mapped.map((inc) => {
          const isSelected = inc.id === selectedId;
          const isHov = inc.id === hovered;
          const color = INCIDENT_COLORS[inc.type] ?? "#6B7280";
          return (
            <Marker
              key={inc.id}
              position={{ lat: inc.lat!, lng: inc.lon! }}
              icon={makeMarkerIcon(color, isSelected || isHov)}
              zIndex={isSelected ? 100 : isHov ? 50 : 1}
              onClick={() => onSelect(inc.id)}
              onMouseOver={() => setHovered(inc.id)}
              onMouseOut={() => setHovered(null)}
            >
              {(isHov && !isSelected) && (
                <InfoWindow position={{ lat: inc.lat!, lng: inc.lon! }} onCloseClick={() => setHovered(null)}>
                  <div className="text-xs font-medium text-slate-800 max-w-[180px]">
                    <div className="font-bold" style={{ color }}>{INCIDENT_LABELS[inc.type] ?? inc.rawType}</div>
                    <div>{inc.suburb || inc.address || "Unknown location"}</div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>

      {/* Controls overlay */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
        {/* Satellite toggle */}
        <button
          onClick={() => setSatellite((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md border transition-colors ${
            satellite
              ? "bg-authority-900 text-white border-authority-700"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          {satellite ? "Streets" : "Satellite"}
        </button>

        {/* Recenter */}
        <button
          onClick={() => mapRef.current?.panTo(WA_CENTER)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md border bg-white text-slate-700 border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          WA
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 px-3 py-2 z-10">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Legend</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(INCIDENT_LABELS).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: INCIDENT_COLORS[type] }} />
              <span className="text-[10px] text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scale pill */}
      <div className="absolute bottom-4 right-3 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-slate-200 px-3 py-1 z-10 text-[10px] text-slate-500 font-medium">
        {mapped.length} plotted / {incidents.length} total
      </div>
    </div>
  );
}
