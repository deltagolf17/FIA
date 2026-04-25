"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
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
}

export function AIAssistPanel({
  firePatterns,
  evidence,
  areaOfOrigin,
  pointOfOrigin,
  firstMaterialIgnited,
  ignitionSource,
  structureType,
  weatherConditions,
}: AIAssistPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setResult("");
    setError("");

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
          {result && !loading && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Analysis ready
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
              <div className="bg-white border border-authority-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono text-xs">
                {result}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={runAnalysis} className="gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Re-analyze
                </Button>
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
