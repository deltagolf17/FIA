"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStatusColor } from "@/lib/nfpa/nfpa921";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Loader2 } from "lucide-react";

const STATUSES = [
  { value: "OPEN",           label: "Open" },
  { value: "IN_PROGRESS",    label: "In Progress" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "CLOSED",         label: "Closed" },
  { value: "ARCHIVED",       label: "Archived" },
];

interface StatusDropdownProps {
  investigationId: string;
  currentStatus: string;
}

export function StatusDropdown({ investigationId, currentStatus }: StatusDropdownProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function update(newStatus: string) {
    if (newStatus === status) { setOpen(false); return; }
    setSaving(true);
    setOpen(false);

    try {
      await fetch(`/api/investigations/${investigationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors",
          getStatusColor(status)
        )}
        disabled={saving}
      >
        {saving
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : <span>{status.replace(/_/g, " ")}</span>
        }
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-slate-200 py-1 min-w-[160px]">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => update(s.value)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50 flex items-center gap-2",
                  s.value === status && "bg-slate-50"
                )}
              >
                <span className={cn("w-2 h-2 rounded-full", {
                  "bg-blue-500":   s.value === "OPEN",
                  "bg-orange-500": s.value === "IN_PROGRESS",
                  "bg-yellow-500": s.value === "PENDING_REVIEW",
                  "bg-green-500":  s.value === "CLOSED",
                  "bg-slate-400":  s.value === "ARCHIVED",
                })} />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
