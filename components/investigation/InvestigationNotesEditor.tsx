"use client";

import { useState, useRef, useCallback } from "react";
import { Loader2, CheckCircle2, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Props {
  investigationId: string;
  initialNotes: string | null;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function InvestigationNotesEditor({ investigationId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(async (value: string) => {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/investigations/${investigationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value }),
      });
      setSaveState(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  }, [investigationId]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setNotes(value);
    setSaveState("idle");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => persist(value), 1200);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col" style={{ minHeight: 360 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Investigation Notes</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {saveState === "saving" && (
            <span className="flex items-center gap-1 text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving…
            </span>
          )}
          {saveState === "saved" && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          )}
          {saveState === "error" && (
            <span className="text-red-500">Save failed</span>
          )}
          {saveState === "idle" && notes.trim() && (
            <span className="text-slate-300 text-xs">{notes.length} chars</span>
          )}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Record scene observations, findings, witness statements, follow-up actions, NFPA section references…"
        className={cn(
          "flex-1 w-full resize-none p-4 text-sm text-slate-800 placeholder-slate-300 focus:outline-none bg-white leading-relaxed",
          "min-h-[300px]"
        )}
      />

      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
        Auto-saves as you type
      </div>
    </div>
  );
}
