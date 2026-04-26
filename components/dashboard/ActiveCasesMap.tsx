"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface MapPin {
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
  pins: MapPin[];
}

const STATUS_COLOR: Record<string, string> = {
  OPEN:           "#2563eb",
  IN_PROGRESS:    "#ea580c",
  PENDING_REVIEW: "#d97706",
  CLOSED:         "#16a34a",
  ARCHIVED:       "#64748b",
};

const CAUSE_RING: Record<string, string> = {
  INCENDIARY: "#ef4444",
  ACCIDENTAL: "#3b82f6",
  NATURAL:    "#22c55e",
};

export function ActiveCasesMap({ pins }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return;

    let map: import("leaflet").Map;

    async function init() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current) return;

      map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      instanceRef.current = map;

      if (pins.length === 0) {
        map.setView([39.8, -89.6], 6);
        return;
      }

      const bounds: [number, number][] = [];

      pins.forEach((pin) => {
        const color = pin.causeCode === "INCENDIARY"
          ? "#ef4444"
          : STATUS_COLOR[pin.status] ?? "#3b82f6";

        const icon = L.divIcon({
          html: `
            <div style="
              width: 28px; height: 28px;
              background: ${color};
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            "></div>
          `,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -30],
        });

        const causeLabel = pin.causeCode
          ? `<span style="
              background: ${CAUSE_RING[pin.causeCode] ?? "#64748b"};
              color: white; font-size: 10px; font-weight: 700;
              padding: 1px 6px; border-radius: 99px;
            ">${pin.causeCode}</span>`
          : '<span style="color:#94a3b8;font-size:10px;">Undetermined</span>';

        const popup = L.popup({ maxWidth: 220 }).setContent(`
          <div style="font-family: system-ui, sans-serif; padding: 2px 0;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; margin-bottom: 2px;">
              ${pin.caseNumber}
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
              ${pin.address}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              ${pin.city}, ${pin.state}
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              ${causeLabel}
              <span style="
                background: #f1f5f9; color: #475569;
                font-size: 10px; font-weight: 600;
                padding: 1px 6px; border-radius: 99px;
              ">${pin.status.replace(/_/g, " ")}</span>
            </div>
            <div style="margin-top: 8px;">
              <a href="/investigations/${pin.id}" style="
                font-size: 11px; color: #1e3a8a; text-decoration: none; font-weight: 600;
              ">View investigation →</a>
            </div>
          </div>
        `);

        L.marker([pin.lat, pin.lng], { icon })
          .bindPopup(popup)
          .addTo(map);

        bounds.push([pin.lat, pin.lng]);
      });

      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }

    init();

    return () => {
      if (instanceRef.current) {
        (instanceRef.current as import("leaflet").Map).remove();
        instanceRef.current = null;
      }
    };
  }, [pins]);

  if (pins.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
        <MapPin className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm">No geolocated investigations yet</p>
        <p className="text-xs mt-1 text-slate-400">Coordinates are set when creating an investigation</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="h-72 w-full rounded-xl overflow-hidden z-0" />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-sm rounded-lg shadow px-3 py-2 flex items-center gap-3 text-xs text-slate-600">
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
