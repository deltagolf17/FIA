"use client";

import { useState, useMemo } from "react";
import type { LiveIncident, RegionFilter, FilterMode } from "@/types/incidents";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, ChevronRight, Search, RefreshCw } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  STRUCTURE_FIRE:  "bg-red-100 text-red-700",
  VEHICLE_FIRE:    "bg-orange-100 text-orange-700",
  VEGETATION_FIRE: "bg-green-100 text-green-700",
  HAZMAT:          "bg-purple-100 text-purple-700",
  RESCUE:          "bg-blue-100 text-blue-700",
  ALARM:           "bg-yellow-100 text-yellow-700",
  OTHER:           "bg-slate-100 text-slate-600",
};

const TYPE_LABELS: Record<string, string> = {
  STRUCTURE_FIRE:  "Structure",
  VEHICLE_FIRE:    "Vehicle",
  VEGETATION_FIRE: "Vegetation",
  HAZMAT:          "HazMat",
  RESCUE:          "Rescue",
  ALARM:           "Alarm",
  OTHER:           "Other",
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-red-500 animate-pulse",
  open:   "bg-orange-400",
  closed: "bg-slate-300",
};

const REGION_OPTIONS: { value: RegionFilter; label: string }[] = [
  { value: "wa",    label: "All WA" },
  { value: "metro", label: "Perth Metro" },
  { value: "25km",  label: "Within 25 km" },
  { value: "50km",  label: "Within 50 km" },
  { value: "100km", label: "Within 100 km" },
  { value: "250km", label: "Within 250 km" },
];

function timeAgo(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "—";
  }
}

interface Props {
  incidents: LiveIncident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  fetchedAt: string | null;
  loading: boolean;
  onRefresh: () => void;
  regionFilter: RegionFilter;
  onRegionChange: (r: RegionFilter) => void;
  filterMode: FilterMode;
  onFilterModeChange: (m: FilterMode) => void;
}

export function IncidentListPanel({
  incidents,
  selectedId,
  onSelect,
  fetchedAt,
  loading,
  onRefresh,
  regionFilter,
  onRegionChange,
  filterMode,
  onFilterModeChange,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = incidents;
    if (filterMode === "active") {
      list = list.filter((i) => i.status === "active");
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.suburb.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q) ||
          i.lga.toLowerCase().includes(q) ||
          i.rawType.toLowerCase().includes(q)
      );
    }
    return list;
  }, [incidents, filterMode, search]);

  const activeCount = incidents.filter((i) => i.status === "active").length;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base leading-none">Live Incidents</h2>
            <p className="text-xs text-slate-400 mt-1">
              {loading ? "Refreshing…" : fetchedAt ? `Updated ${timeAgo(fetchedAt)}` : "—"}
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-fire-600 hover:bg-fire-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Region filter */}
        <select
          value={regionFilter}
          onChange={(e) => onRegionChange(e.target.value as RegionFilter)}
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-fire-500 mb-3"
        >
          {REGION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Tab switcher */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => onFilterModeChange("active")}
            className={`flex-1 text-xs py-1.5 font-medium transition-colors ${
              filterMode === "active"
                ? "bg-fire-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => onFilterModeChange("all_open")}
            className={`flex-1 text-xs py-1.5 font-medium transition-colors border-l border-slate-200 ${
              filterMode === "all_open"
                ? "bg-fire-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Open ({incidents.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suburb, LGA, type…"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-fire-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-xs">Loading incidents…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-1 text-slate-400">
            <span className="text-sm">No incidents found</span>
            <span className="text-xs">Try changing filter or region</span>
          </div>
        ) : (
          <ul>
            {filtered.map((inc) => (
              <li key={inc.id}>
                <button
                  onClick={() => onSelect(inc.id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                    selectedId === inc.id ? "bg-fire-50 border-l-2 border-l-fire-500" : ""
                  }`}
                >
                  {/* Status dot */}
                  <div className="mt-1.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${STATUS_DOT[inc.status] ?? "bg-slate-300"}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span
                        className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                          TYPE_COLORS[inc.type] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {TYPE_LABELS[inc.type] ?? inc.rawType}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{timeAgo(inc.startDate)}</span>
                    </div>

                    <div className="font-semibold text-xs text-slate-800 truncate">
                      {inc.suburb || inc.address || "Location TBC"}
                    </div>

                    {inc.lga && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-500 truncate">{inc.lga}</span>
                      </div>
                    )}

                    {inc.fdrRating && inc.fdrRating !== "No Rating" && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-500">FDR: {inc.fdrRating}</span>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 mt-1 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
        Data: Emergency WA · Auto-refreshes every 60s
      </div>
    </div>
  );
}
