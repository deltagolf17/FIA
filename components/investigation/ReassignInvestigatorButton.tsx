"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserCog, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Investigator {
  id: string;
  name: string;
  role: string;
  department?: string | null;
}

interface Props {
  investigationId: string;
  currentInvestigatorId: string;
}

export function ReassignInvestigatorButton({ investigationId, currentInvestigatorId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [investigators, setInvestigators] = useState<Investigator[]>([]);
  const [selected, setSelected] = useState(currentInvestigatorId);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setFetching(true);
    fetch("/api/investigators")
      .then((r) => r.json())
      .then((data) => setInvestigators(Array.isArray(data) ? data : []))
      .catch(() => setInvestigators([]))
      .finally(() => setFetching(false));
  }, [open]);

  async function save() {
    if (selected === currentInvestigatorId) { setOpen(false); return; }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/investigations/${investigationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investigatorId: selected }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMsg({ type: "err", text: data.error ?? "Failed to reassign" });
      } else {
        setMsg({ type: "ok", text: "Reassigned successfully" });
        setTimeout(() => { setOpen(false); setMsg(null); router.refresh(); }, 800);
      }
    } catch {
      setMsg({ type: "err", text: "Network error — please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5 text-xs">
        <UserCog className="w-3.5 h-3.5" />
        Reassign
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Reassign Investigator</h2>

            {fetching ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-4 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading investigators…
              </div>
            ) : (
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-authority-500"
              >
                {investigators.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} — {inv.role.replace("_", " ")}{inv.department ? ` (${inv.department})` : ""}
                  </option>
                ))}
              </select>
            )}

            {msg && (
              <p className={`text-xs flex items-center gap-1.5 ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
                {msg.type === "ok" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {msg.text}
              </p>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" size="sm" onClick={() => { setOpen(false); setMsg(null); }}>Cancel</Button>
              <Button size="sm" onClick={save} disabled={loading || fetching} className="gap-1.5">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
