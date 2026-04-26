"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, ChevronUp, Loader2, AlertCircle, Save, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AIAssistPanelProps {
  investigationId: string;
  firePatterns: Array<{ patternType: string; location: string; description: string; charDepth?: number | null }>;
  evidence: Array<{ itemNumber: string; description: string; location: string }>;
  areaOfOrigin?: string | null;
  pointOfOrigin?: string | null;
  firstMaterialIgnited?: string | null;
  ignitionSource?: string | null;
  structureType?: string | null;
  weatherConditions?: string | null;
  savedSuggestion?: string | null;
}

export function AIAssistPanel({
  investigationId,
  firePatterns,
  evidence,
  areaOfOrigin,
  pointOfOrigin,
  firstMaterialIgnited,
  ignitionSource,
  structureType,
  weatherConditions,
  savedSuggestion,
}: AIAssistPanelProps) {
  const [open, setOpen] = useState(!!savedSuggestion);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(savedSuggestion ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(!!savedSuggestion);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setResult("");
    setError("");
    setSaved(false);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/suggest-cause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firePatterns,
          evidence,
          areaOfOrigin,
          pointOfOrigin,
          firstMaterialIgnited,
          ignitionSource,
          structureType,
          weatherConditions,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("AI analysis failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResult((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError("AI analysis failed. Check that ANTHROPIC_API_KEY is set.");
      }
    } finally {
      setLoading(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
    setLoading(false);
  }

  async function saveToRecord() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/investigations/${investigationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiSuggestion: result }),
      });
      if (!res.ok) {
        setSaveError("Failed to save — please try again.");
      } else {
        setSaved(true);
      }
    } catch {
      setSaveError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cn(
      "border rounded-xl transition-all",
      open ? "border-authority-200 bg-authority-50/50" : "border-slate-200 bg-white"
    )}>
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-authority-700 to-fire-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">AI Cause Analysis</p>
            <p className="text-xs text-slate-500">Claude · NFPA 921 methodology</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Saved to record
            </span>
          )}
          {result && !loading && !saved && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              Analysis ready — unsaved
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-slate-500">
            Claude will analyze your documented fire patterns, evidence, and scene data to suggest a NFPA 921-compliant cause classification with supporting reasoning.
          </p>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          {!result && !loading && (
            <Button size="sm" onClick={runAnalysis} className="gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Analyze with Claude
            </Button>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-authority-700">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analyzing scene data against NFPA 921 criteria…
              </div>
              <Button size="sm" variant="outline" onClick={stop}>Stop</Button>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="bg-white border border-authority-100 rounded-xl p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-mono">
                {result}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={runAnalysis} disabled={loading} className="gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Re-analyze
                </Button>
                {!saved && (
                  <div className="flex flex-col gap-1">
                    <Button size="sm" onClick={saveToRecord} disabled={saving || loading} className="gap-1.5">
                      {saving
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Save className="w-3.5 h-3.5" />
                      }
                      Save to Record
                    </Button>
                    {saveError && (
                      <p className="text-[11px] text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{saveError}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400">
                AI suggestions are advisory only. Final determination must be made by the certified investigator per NFPA 1033.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
