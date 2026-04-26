"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Edit3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Claim {
  id: string;
  adjusterName: string | null;
  adjusterEmail: string | null;
  estimatedLoss: number | null;
  finalLoss: number | null;
  notes: string | null;
}

interface Props {
  claim: Claim;
  onClose: () => void;
}

export function EditClaimModal({ claim, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    adjusterName:  claim.adjusterName  ?? "",
    adjusterEmail: claim.adjusterEmail ?? "",
    estimatedLoss: claim.estimatedLoss != null ? String(claim.estimatedLoss) : "",
    finalLoss:     claim.finalLoss     != null ? String(claim.finalLoss)     : "",
    notes:         claim.notes         ?? "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body: Record<string, unknown> = {
      adjusterName:  form.adjusterName.trim()  || null,
      adjusterEmail: form.adjusterEmail.trim() || null,
      notes:         form.notes.trim()         || null,
      estimatedLoss: form.estimatedLoss ? Number(form.estimatedLoss) : null,
      finalLoss:     form.finalLoss     ? Number(form.finalLoss)     : null,
    };

    try {
      const res = await fetch(`/api/insurance/${claim.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to save changes");
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-authority-700" />
            <h2 className="font-semibold text-slate-900">Edit Claim Details</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="adjusterName">Adjuster Name</Label>
              <Input
                id="adjusterName"
                value={form.adjusterName}
                onChange={(e) => set("adjusterName", e.target.value)}
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="adjusterEmail">Adjuster Email</Label>
              <Input
                id="adjusterEmail"
                type="email"
                value={form.adjusterEmail}
                onChange={(e) => set("adjusterEmail", e.target.value)}
                placeholder="jane@insurer.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="estimatedLoss">Estimated Loss ($)</Label>
              <Input
                id="estimatedLoss"
                type="number"
                min="0"
                step="0.01"
                value={form.estimatedLoss}
                onChange={(e) => set("estimatedLoss", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="finalLoss">Final Loss ($) <span className="text-slate-400 font-normal text-xs">optional</span></Label>
              <Input
                id="finalLoss"
                type="number"
                min="0"
                step="0.01"
                value={form.finalLoss}
                onChange={(e) => set("finalLoss", e.target.value)}
                placeholder="Leave blank if pending"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={4}
              placeholder="Adjuster notes, coverage remarks, investigation observations…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-authority-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-authority-700 hover:bg-authority-800" disabled={loading}>
              {loading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
