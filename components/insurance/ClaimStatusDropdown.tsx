"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

const STATUSES = ["OPEN", "UNDER_REVIEW", "APPROVED", "DENIED", "CLOSED"] as const;
type ClaimStatus = (typeof STATUSES)[number];

const STATUS_COLORS: Record<ClaimStatus, string> = {
  OPEN:         "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
  APPROVED:     "bg-green-100 text-green-800",
  DENIED:       "bg-red-100 text-red-800",
  CLOSED:       "bg-slate-100 text-slate-600",
};

interface Props {
  claimId: string;
  currentStatus: string;
}

export function ClaimStatusDropdown({ claimId, currentStatus }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus as ClaimStatus);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function select(s: ClaimStatus) {
    setOpen(false);
    if (s === status) return;
    setLoading(true);
    setStatus(s);
    await fetch(`/api/insurance/${claimId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className={cn(
          "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors",
          STATUS_COLORS[status] ?? "bg-slate-100 text-slate-600",
          "hover:opacity-80"
        )}
      >
        {status.replace("_", " ")}
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[140px]">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => select(s)}
              className={cn(
                "w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50",
                s === status ? "text-authority-800 bg-authority-50" : "text-slate-700"
              )}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
