"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, Plus, Loader2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Investigation {
  id: string;
  caseNumber: string;
  address: string;
  hasClam: boolean;
}

interface Props {
  investigations: Investigation[];
}

function generateClaimNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `CLM-${year}-${rand}`;
}

export function NewClaimModal({ investigations }: Props) {
  const router = useRouter();
  const available = investigations.filter((i) => !i.hasClam);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    investigationId: "",
    claimNumber: generateClaimNumber(),
    policyNumber: "",
    insuredName: "",
    insurerName: "",
    coverageType: "",
    estimatedLoss: "",
    deductible: "",
    adjusterName: "",
    adjusterEmail: "",
    notes: "",
  });

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.investigationId) { setError("Select a linked investigation."); return; }
    if (!form.policyNumber.trim()) { setError("Policy number is required."); return; }
    if (!form.insuredName.trim()) { setError("Insured name is required."); return; }
    if (!form.insurerName.trim()) { setError("Insurer name is required."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/insurance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          estimatedLoss: form.estimatedLoss ? Number(form.estimatedLoss) : null,
          deductible: form.deductible ? Number(form.deductible) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create claim."); return; }
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-authority-500 focus:border-transparent";

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="w-3.5 h-3.5" />
        New Claim
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-authority-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-4.5 h-4.5 text-authority-700" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">New Insurance Claim</p>
                  <p className="text-xs text-slate-500">Link to a fire investigation</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Linked investigation */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                  Linked Investigation <span className="text-red-500">*</span>
                </label>
                {available.length === 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                    All investigations already have linked claims. Create a new investigation first.
                  </p>
                ) : (
                  <select
                    value={form.investigationId}
                    onChange={(e) => set("investigationId", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">— Select investigation —</option>
                    {available.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.caseNumber} — {inv.address}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Claim & policy */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Claim & Policy</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Claim Number <span className="text-red-500">*</span></label>
                    <input value={form.claimNumber} onChange={(e) => set("claimNumber", e.target.value)} className={cn(inputClass, "font-mono")} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Policy Number <span className="text-red-500">*</span></label>
                    <input value={form.policyNumber} onChange={(e) => set("policyNumber", e.target.value)} className={cn(inputClass, "font-mono")} placeholder="POL-XXXXXXXX" />
                  </div>
                </div>
              </div>

              {/* Insured & insurer */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Parties</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Insured Name <span className="text-red-500">*</span></label>
                    <input value={form.insuredName} onChange={(e) => set("insuredName", e.target.value)} className={inputClass} placeholder="John Smith" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Insurer / Company <span className="text-red-500">*</span></label>
                    <input value={form.insurerName} onChange={(e) => set("insurerName", e.target.value)} className={inputClass} placeholder="State Farm" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Coverage Type</label>
                    <select value={form.coverageType} onChange={(e) => set("coverageType", e.target.value)} className={inputClass}>
                      <option value="">— Select —</option>
                      {["Homeowners", "Commercial Property", "Renters", "Vehicle", "Liability", "Other"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Financials (optional)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Estimated Loss ($)</label>
                    <input
                      type="number"
                      value={form.estimatedLoss}
                      onChange={(e) => set("estimatedLoss", e.target.value)}
                      className={inputClass}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Deductible ($)</label>
                    <input
                      type="number"
                      value={form.deductible}
                      onChange={(e) => set("deductible", e.target.value)}
                      className={inputClass}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Adjuster */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Adjuster (optional)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Adjuster Name</label>
                    <input value={form.adjusterName} onChange={(e) => set("adjusterName", e.target.value)} className={inputClass} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Adjuster Email</label>
                    <input type="email" value={form.adjusterEmail} onChange={(e) => set("adjusterEmail", e.target.value)} className={inputClass} placeholder="jane@insurer.com" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-slate-500 block mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  className={cn(inputClass, "resize-none h-16")}
                  placeholder="Initial claim notes…"
                />
              </div>

              {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || available.length === 0} className="gap-1.5">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Create Claim
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
