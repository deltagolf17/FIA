"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Flame, RefreshCw, Radio, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { EmergencyIncident } from "@/app/api/emergency-incidents/route";

interface FeedData {
  incidents: EmergencyIncident[];
  warnings: EmergencyIncident[];
  totalFireBans: string[];
  fetchedAt: string;
  counts: { incidents: number; fires: number; warnings: number; totalFireBans: number };
}

const CATEGORY_COLOR: Record<string, string> = {
  FIRE:     "bg-red-100 text-red-800",
  INCIDENT: "bg-orange-100 text-orange-800",
  HAZMAT:   "bg-purple-100 text-purple-800",
  RESCUE:   "bg-blue-100 text-blue-800",
};

function timeSince(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function EmergencyWAPanel() {
  const [data, setData] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/emergency-incidents");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: FeedData = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 2 * 60 * 1000); // refresh every 2 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-red-600" />
          <span className="text-sm font-semibold text-slate-800">Emergency WA — Live Feed</span>
          {data && (
            <span className="text-xs text-slate-400">
              Updated {lastRefresh ? timeSince(lastRefresh.toISOString()) : "—"}
            </span>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
          title="Refresh"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 text-xs text-amber-700 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Could not reach Emergency WA feed: {error}
        </div>
      )}

      {/* Total Fire Bans strip */}
      {data && data.totalFireBans.length > 0 && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2 flex-wrap">
          <ShieldAlert className="w-3.5 h-3.5 text-red-700 shrink-0" />
          <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Total Fire Bans:</span>
          {data.totalFireBans.slice(0, 5).map((ban, i) => (
            <span key={i} className="text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full">{ban}</span>
          ))}
        </div>
      )}

      {/* Counts summary */}
      {data && (
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
          {[
            { label: "Active Incidents", value: data.counts.incidents, color: "text-orange-600" },
            { label: "Fire Incidents",   value: data.counts.fires,     color: "text-red-600" },
            { label: "Warnings",         value: data.counts.warnings,  color: "text-amber-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="px-4 py-3 text-center">
              <p className={cn("text-xl font-bold", color)}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Incident list */}
      <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
        {loading && !data && (
          <div className="px-4 py-8 text-center">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading Emergency WA feed…</p>
          </div>
        )}

        {data && data.incidents.length === 0 && !loading && (
          <div className="px-4 py-8 text-center">
            <Flame className="w-5 h-5 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No active incidents reported</p>
          </div>
        )}

        {data?.incidents.slice(0, 15).map((inc) => (
          <div key={inc.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0 mt-1.5",
              inc.isFire ? "bg-red-500" : "bg-orange-400"
            )} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded shrink-0",
                  CATEGORY_COLOR[inc.category] ?? "bg-slate-100 text-slate-600"
                )}>
                  {inc.category}
                </span>
                <span className="text-xs text-slate-600 truncate">{inc.type}</span>
              </div>
              <p className="text-xs font-medium text-slate-800 truncate">{inc.location || inc.title}</p>
              {inc.description && (
                <p className="text-xs text-slate-400 mt-0.5 truncate">{inc.description}</p>
              )}
            </div>
            <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">{timeSince(inc.pubDate)}</span>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">Source: Emergency WA (DFES)</span>
        <a
          href="https://www.emergency.wa.gov.au"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-authority-700 hover:underline"
        >
          emergency.wa.gov.au →
        </a>
      </div>
    </div>
  );
}
