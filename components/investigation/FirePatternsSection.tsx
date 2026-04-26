"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FIRE_PATTERN_TYPES } from "@/lib/nfpa/nfpa921";
import { Flame, Plus, X, Trash2, Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FirePattern {
  id: string;
  patternType: string;
  location: string;
  description: string;
  charDepth: number | null;
  nfpaSection: string | null;
  significance: string | null;
  notes: string | null;
}

interface Props {
  patterns: FirePattern[];
  investigationId: string;
}

const inputClass =
  "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-authority-500 focus:border-transparent";

function PatternForm({
  investigationId,
  editTarget,
  onSaved,
  onCancel,
}: {
  investigationId?: string;
  editTarget?: FirePattern;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!editTarget;
  const [form, setForm] = useState({
    patternType: editTarget?.patternType ?? "V_PATTERN",
    location: editTarget?.location ?? "",
    description: editTarget?.description ?? "",
    charDepth: editTarget?.charDepth != null ? String(editTarget.charDepth) : "",
    significance: editTarget?.significance ?? "",
    notes: editTarget?.notes ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedType = FIRE_PATTERN_TYPES.find((t) => t.type === form.patternType);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.location.trim()) { setError("Location is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    setError("");
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/firepatterns/${editTarget!.id}` : "/api/firepatterns";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEdit ? {} : { investigationId }),
          patternType: form.patternType,
          location: form.location.trim(),
          description: form.description.trim(),
          charDepth: form.charDepth ? Number(form.charDepth) : null,
          nfpaSection: selectedType?.section ?? null,
          significance: form.significance.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });
      if (!res.ok) { setError("Failed to save pattern."); return; }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{isEdit ? "Edit Fire Pattern" : "New Fire Pattern"}</p>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">
            Pattern Type <span className="text-red-500">*</span>
          </label>
          <select
            value={form.patternType}
            onChange={(e) => set("patternType", e.target.value)}
            className={inputClass}
          >
            {FIRE_PATTERN_TYPES.map((t) => (
              <option key={t.type} value={t.type}>{t.label}</option>
            ))}
          </select>
          {selectedType && (
            <p className="text-[11px] text-authority-600 mt-1">{selectedType.section}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className={inputClass}
            placeholder="e.g. North wall of living room"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={cn(inputClass, "resize-none")}
          placeholder={selectedType?.description ?? "Describe the pattern observed…"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Char Depth (mm)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.charDepth}
            onChange={(e) => set("charDepth", e.target.value)}
            className={inputClass}
            placeholder="e.g. 12.5"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Significance</label>
          <input
            value={form.significance}
            onChange={(e) => set("significance", e.target.value)}
            className={inputClass}
            placeholder="Investigative relevance"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">Notes</label>
        <input
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className={inputClass}
          placeholder="Additional observations"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting} className="gap-1.5">
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {isEdit ? "Save Changes" : "Add Pattern"}
        </Button>
      </div>
    </form>
  );
}

export function FirePatternsSection({ patterns: initial, investigationId }: Props) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this fire pattern? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/firepatterns/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  function handleSaved() {
    setShowAddForm(false);
    setEditingId(null);
    router.refresh();
  }

  if (initial.length === 0 && !showAddForm) {
    return (
      <div className="space-y-3">
        <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200">
          <Flame className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No fire patterns documented</p>
          <p className="text-xs mt-1 text-slate-400">Add patterns observed at the scene</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Add Fire Pattern
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {initial.map((p, i) => (
        editingId === p.id ? (
          <PatternForm
            key={p.id}
            editTarget={p}
            onSaved={handleSaved}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <Card key={p.id} className="group">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium bg-fire-100 text-fire-800 px-2 py-0.5 rounded-full">
                    {p.patternType.replace(/_/g, " ")}
                  </span>
                  {p.nfpaSection && (
                    <span className="text-xs text-authority-600 bg-authority-50 px-2 py-0.5 rounded">
                      {p.nfpaSection}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400 mr-1">Pattern #{i + 1}</span>
                  <button
                    onClick={() => { setEditingId(p.id); setShowAddForm(false); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-authority-50 text-slate-400 hover:text-authority-600 transition-all"
                    title="Edit pattern"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                    title="Delete pattern"
                  >
                    {deleting === p.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-1">
                Location: <span className="text-slate-700 font-medium">{p.location}</span>
              </p>
              <p className="text-sm text-slate-700">{p.description}</p>
              {p.charDepth != null && (
                <p className="text-xs text-slate-500 mt-2">
                  Char depth: <span className="font-medium">{p.charDepth} mm</span>
                </p>
              )}
              {p.significance && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Significance: {p.significance}</p>
                </div>
              )}
              {p.notes && (
                <p className="text-xs text-slate-400 mt-1">Notes: {p.notes}</p>
              )}
            </CardContent>
          </Card>
        )
      ))}

      {showAddForm ? (
        <PatternForm
          investigationId={investigationId}
          onSaved={handleSaved}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <Button size="sm" variant="outline" onClick={() => { setShowAddForm(true); setEditingId(null); }} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Add Fire Pattern
        </Button>
      )}
    </div>
  );
}
