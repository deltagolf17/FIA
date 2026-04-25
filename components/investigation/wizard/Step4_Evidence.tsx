"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { EvidenceData } from "@/types";
import { Plus, Trash2, Info, Package } from "lucide-react";

interface Props {
  data: EvidenceData[];
  onChange: (d: EvidenceData[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const empty: EvidenceData = {
  itemNumber: "",
  description: "",
  location: "",
  condition: "",
  notes: "",
};

export function Step4_Evidence({ data, onChange, onNext, onBack }: Props) {
  const [items, setItems] = useState<EvidenceData[]>(data);

  function add() {
    const nextNum = (items.length + 1).toString().padStart(3, "0");
    setItems((p) => [...p, { ...empty, itemNumber: `E-${nextNum}` }]);
  }

  function remove(i: number) {
    setItems((p) => p.filter((_, idx) => idx !== i));
  }

  function update(i: number, field: keyof EvidenceData, value: string) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function handleNext() {
    onChange(items);
    onNext();
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex items-start gap-3 bg-authority-50 border border-authority-100 rounded-xl p-4">
        <Info className="w-4 h-4 text-authority-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-authority-800">NFPA 921 §15 — Physical Evidence</p>
          <p className="text-xs text-authority-600 mt-0.5">Document all physical evidence collected. Each item receives a tracking number for chain of custody. Photos and lab submissions are managed in the Evidence tab after case creation.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
          <Package className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm font-medium">No evidence items added yet</p>
          <p className="text-xs mt-1">Record all physical evidence collected from the scene</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={add}>
            <Plus className="w-3.5 h-3.5" />
            Add Evidence Item
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-authority-800">{item.itemNumber || `Item #${i + 1}`}</span>
                <button onClick={() => remove(i)} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Item Number</Label>
                  <Input
                    value={item.itemNumber}
                    onChange={(e) => update(i, "itemNumber", e.target.value)}
                    placeholder="E-001"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Condition</Label>
                  <Input
                    value={item.condition}
                    onChange={(e) => update(i, "condition", e.target.value)}
                    placeholder="Intact, burned, melted..."
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Description <span className="text-red-500">*</span></Label>
                  <Input
                    value={item.description}
                    onChange={(e) => update(i, "description", e.target.value)}
                    placeholder="Describe the evidence item..."
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Location Found</Label>
                  <Input
                    value={item.location}
                    onChange={(e) => update(i, "location", e.target.value)}
                    placeholder="Where was this collected from?"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Notes</Label>
                  <Textarea
                    value={item.notes}
                    onChange={(e) => update(i, "notes", e.target.value)}
                    rows={2}
                    placeholder="Additional notes about this evidence..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <Button variant="outline" size="sm" onClick={add} className="w-full border-dashed">
          <Plus className="w-3.5 h-3.5" />
          Add Another Evidence Item
        </Button>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext}>Continue — Origin Determination</Button>
      </div>
    </div>
  );
}
