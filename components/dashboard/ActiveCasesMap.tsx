"use client";

import { useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { useState } from "react";

interface MapPinData {
  id: string;
  caseNumber: string;
  address: string;
  city: string;
  state: string;
  status: string;
  causeCode: string | null;
  lat: number;
  lng: number;
}

interface Props {
  pins: MapPinData[];
}

const STATUS_COLOR: Record<string, string> = {
  OPEN:           "#2563eb",
  IN_PROGRESS:    "#ea580c",
  PENDING_REVIEW: "#d97706",
  CLOSED:         "#16a34a",
  ARCHIVED:       "#64748b",
};

const WA_CENTER = { lat: -31.9505, lng: 115.8605 };

const MAP_STYLES = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
];

function getPinColor(pin: MapPinData): string {
  if (pin.causeCode === "INCENDIARY") return "#ef4444";
  return STATUS_COLOR[pin.status] ?? "#3b82f6";
}

export function ActiveCasesMap({ pins }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const [activePin, setActivePin] = useState<MapPinData | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      if (pins.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        pins.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
        map.fitBounds(bounds, 40);
      } else if (pins.length === 1) {
        map.setCenter({ lat: pins[0].lat, lng: pins[0].lng });
        map.setZoom(11);
      }
    },
    [pins]
  );

  if (pins.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
        <MapPin className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm">No geolocated investigations yet</p>
        <p className="text-xs mt-1 text-slate-400">Coordinates are set when creating an investigation</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
        <MapPin className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm">Map unavailable</p>
        <p className="text-xs mt-1 text-red-400">{loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-72 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
        <div className="w-6 h-6 border-2 border-authority-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "288px" }}
        center={WA_CENTER}
        zoom={5}
        onLoad={onLoad}
        options={{
          styles: MAP_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          scrollwheel: false,
        }}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={{ lat: pin.lat, lng: pin.lng }}
            onClick={() => setActivePin(pin)}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: getPinColor(pin),
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2.5,
            }}
          />
        ))}

        {activePin && (
          <InfoWindow
            position={{ lat: activePin.lat, lng: activePin.lng }}
            onCloseClick={() => setActivePin(null)}
          >
            <div style={{ fontFamily: "system-ui, sans-serif", padding: "4px 2px", minWidth: 180 }}>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 2 }}>
                {activePin.caseNumber}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>
                {activePin.address}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>
                {activePin.city}, {activePin.state}
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                {activePin.causeCode && (
                  <span style={{ background: getPinColor(activePin), color: "white", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99 }}>
                    {activePin.causeCode}
                  </span>
                )}
                <span style={{ background: "#f1f5f9", color: "#475569", fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 99 }}>
                  {activePin.status.replace(/_/g, " ")}
                </span>
              </div>
              <a href={`/investigations/${activePin.id}`} style={{ fontSize: 11, color: "#1e3a8a", textDecoration: "none", fontWeight: 600 }}>
                View investigation →
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow px-3 py-2 flex items-center gap-3 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Incendiary
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-fire-600 inline-block" /> In Progress
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-600 inline-block" /> Closed
        </span>
      </div>
    </div>
  );
}
