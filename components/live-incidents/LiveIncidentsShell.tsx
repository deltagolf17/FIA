"use client";

import { useState, useEffect, useCallback } from "react";
import type { LiveIncident, RegionFilter, FilterMode } from "@/types/incidents";
import { IncidentMap } from "./IncidentMap";
import { IncidentListPanel } from "./IncidentListPanel";
import { IncidentDetailPanel } from "./IncidentDetailPanel";

const METRO_BOUNDS = { latMin: -32.8, latMax: -31.3, lonMin: 115.4, lonMax: 116.4 };
const RADIUS_KM = { "25km": 25, "50km": 50, "100km": 100, "250km": 250 };
const WA_USER_CENTER = { lat: -31.9522, lng: 115.8589 }; // Perth as default user location

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function filterByRegion(incidents: LiveIncident[], region: RegionFilter): LiveIncident[] {
  if (region === "wa") return incidents;
  if (region === "metro") {
    return incidents.filter(
      (i) =>
        i.lat != null &&
        i.lon != null &&
        i.lat >= METRO_BOUNDS.latMin &&
        i.lat <= METRO_BOUNDS.latMax &&
        i.lon >= METRO_BOUNDS.lonMin &&
        i.lon <= METRO_BOUNDS.lonMax
    );
  }
  const radiusKm = RADIUS_KM[region as keyof typeof RADIUS_KM];
  if (!radiusKm) return incidents;
  return incidents.filter(
    (i) =>
      i.lat != null &&
      i.lon != null &&
      haversine(WA_USER_CENTER.lat, WA_USER_CENTER.lng, i.lat, i.lon) <= radiusKm
  );
}

export function LiveIncidentsShell() {
  const [allIncidents, setAllIncidents] = useState<LiveIncident[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [regionFilter, setRegionFilter] = useState<RegionFilter>("wa");
  const [filterMode, setFilterMode] = useState<FilterMode>("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/live-incidents");
      const data = await res.json();
      setAllIncidents(data.incidents ?? []);
      setFetchedAt(data.fetchedAt ?? null);
    } catch {
      // silent — keep existing data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 60_000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const filteredIncidents = filterByRegion(allIncidents, regionFilter);
  const selectedIncident = selectedId ? allIncidents.find((i) => i.id === selectedId) ?? null : null;

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      {/* Map — left 65% */}
      <div className="flex-1 relative">
        <IncidentMap
          incidents={filteredIncidents}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId((prev) => (prev === id ? null : id))}
        />
      </div>

      {/* Panel — right 35%, min 320px */}
      <div className="w-[360px] min-w-[300px] max-w-[420px] border-l border-slate-200 overflow-hidden flex flex-col">
        {selectedIncident ? (
          <IncidentDetailPanel
            incident={selectedIncident}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <IncidentListPanel
            incidents={filteredIncidents}
            selectedId={selectedId}
            onSelect={setSelectedId}
            fetchedAt={fetchedAt}
            loading={loading}
            onRefresh={fetchIncidents}
            regionFilter={regionFilter}
            onRegionChange={setRegionFilter}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
          />
        )}
      </div>
    </div>
  );
}
