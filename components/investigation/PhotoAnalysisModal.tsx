"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PhotoAnalysisModalProps {
  photos: string[];
  initialIndex?: number;
  evidenceDescription?: string;
  evidenceLocation?: string;
  caseNumber?: string;
  structureType?: string;
  onClose: () => void;
}

export function PhotoAnalysisModal({
  photos,
  initialIndex = 0,
  evidenceDescription,
  evidenceLocation,
  caseNumber,
  structureType,
  onClose,
}: PhotoAnalysisModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [analysisText, setAnalysisText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analyzed, setAnalyzed] = useState<Set<number>>(new Set());
  const analysisRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll analysis panel as text streams in
    if (analysisRef.current) {
      analysisRef.current.scrollTop = analysisRef.current.scrollHeight;
    }
  }, [analysisText]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function prev() {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setAnalysisText("");
      setError("");
    }
  }

  function next() {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(i => i + 1);
      setAnalysisText("");
      setError("");
    }
  }

  async function analyzePhoto() {
    if (!currentPhoto || analyzing) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setAnalyzing(true);
    setAnalysisText("");
    setError("");

    try {
      const res = await fetch("/api/ai/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          imageBase64: currentPhoto,
          mediaType: "image/jpeg",
          evidenceDescription,
          evidenceLocation,
          caseNumber,
          structureType,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Analysis failed. Please try again.");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setError("No response stream."); return; }

      const decoder = new TextDecoder();
      setAnalyzed(s => new Set(s).add(currentIndex));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnalysisText(t => t + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError("Analysis failed. Please try again.");
      }
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-slate-800 text-sm">AI Photo Analysis</span>
            <span className="text-xs text-slate-400 font-mono">NFPA 921</span>
          </div>
          <div className="flex items-center gap-3">
            {photos.length > 1 && (
              <span className="text-xs text-slate-500">
                {currentIndex + 1} / {photos.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">

          {/* Left: Photo viewer */}
          <div className="lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200">
            <div className="relative flex-1 bg-slate-900 flex items-center justify-center min-h-[200px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPhoto}
                alt={`Evidence photo ${currentIndex + 1}`}
                className="max-h-[360px] max-w-full object-contain"
              />

              {/* Navigation arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    disabled={currentIndex === 0}
                    className={cn(
                      "absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-black/40 text-white transition-opacity",
                      currentIndex === 0 ? "opacity-20 cursor-not-allowed" : "hover:bg-black/60"
                    )}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={next}
                    disabled={currentIndex === photos.length - 1}
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-black/40 text-white transition-opacity",
                      currentIndex === photos.length - 1 ? "opacity-20 cursor-not-allowed" : "hover:bg-black/60"
                    )}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Photo strip */}
            {photos.length > 1 && (
              <div className="flex gap-1.5 p-2 overflow-x-auto bg-slate-800">
                {photos.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIndex(i); setAnalysisText(""); setError(""); }}
                    className={cn(
                      "shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors",
                      i === currentIndex ? "border-orange-400" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Context info */}
            {(evidenceDescription || evidenceLocation) && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 space-y-1">
                {evidenceDescription && (
                  <p className="text-xs text-slate-700">
                    <span className="font-medium">Evidence:</span> {evidenceDescription}
                  </p>
                )}
                {evidenceLocation && (
                  <p className="text-xs text-slate-500">
                    <span className="font-medium">Location:</span> {evidenceLocation}
                  </p>
                )}
              </div>
            )}

            {/* Analyze button */}
            <div className="p-4 border-t border-slate-200">
              <Button
                onClick={analyzePhoto}
                disabled={analyzing}
                className={cn(
                  "w-full gap-2 text-sm",
                  analyzed.has(currentIndex) && !analyzing
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-orange-600 hover:bg-orange-700"
                )}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing with Claude AI...
                  </>
                ) : analyzed.has(currentIndex) ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Re-analyze Photo
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze with AI (NFPA 921)
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right: Analysis output */}
          <div className="lg:w-1/2 flex flex-col min-h-0">
            <div className="px-5 py-3 border-b border-slate-200 shrink-0">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                NFPA 921 Analysis
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                AI-generated — verify all findings independently
              </p>
            </div>

            <div ref={analysisRef} className="flex-1 overflow-y-auto p-5">
              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {!analysisText && !error && !analyzing && (
                <div className="text-center py-16">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                  <p className="text-sm text-slate-400">
                    Click &quot;Analyze with AI&quot; to get an NFPA 921-compliant analysis of this fire scene photo.
                  </p>
                  <p className="text-xs text-slate-300 mt-2">
                    Powered by Claude claude-sonnet-4-6
                  </p>
                </div>
              )}

              {analyzing && !analysisText && (
                <div className="flex items-center gap-3 text-sm text-slate-500 py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500 shrink-0" />
                  <span>Claude is examining the fire scene photo...</span>
                </div>
              )}

              {analysisText && (
                <div className="prose prose-sm max-w-none text-slate-800 text-sm leading-relaxed space-y-3">
                  {analysisText.split("\n").map((line, i) => {
                    if (line.startsWith("### ")) {
                      return (
                        <h3 key={i} className="text-sm font-bold text-authority-800 mt-4 mb-1 first:mt-0">
                          {line.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (line.startsWith("## ")) {
                      return (
                        <h2 key={i} className="text-sm font-bold text-slate-900 mt-4 mb-1 first:mt-0 border-b border-slate-200 pb-1">
                          {line.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <p key={i} className="font-semibold text-slate-800">
                          {line.replace(/\*\*/g, "")}
                        </p>
                      );
                    }
                    if (line.startsWith("- ") || line.startsWith("• ")) {
                      return (
                        <p key={i} className="pl-3 text-slate-700 flex gap-1.5">
                          <span className="text-orange-400 shrink-0">•</span>
                          <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
                        </p>
                      );
                    }
                    if (line.trim() === "") return <div key={i} className="h-1" />;
                    return (
                      <p
                        key={i}
                        className="text-slate-700"
                        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }}
                      />
                    );
                  })}
                  {analyzing && (
                    <span className="inline-block w-1.5 h-4 bg-orange-400 animate-pulse ml-0.5 rounded-sm" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
