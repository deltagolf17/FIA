"use client";

import { useState } from "react";
import { FIRE_PATTERN_TYPES } from "@/lib/nfpa/nfpa921";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FirePatternData, PatternType } from "@/types";
import { Plus, Trash2, Info, Flame } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Props {
  data: FirePatternData[];
  onChange: (d: FirePatternData[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const empty: FirePatternData = {
  patternType: "V_PATTERN",
  location: "",
  description: "",
  charDepth: "",
  heatIndicators: "",
  nfpaSection: "",
  significance: "",
};

export function Step3_FirePatterns({ data, onChange, onNext, onBack }: Props) {
  const [patterns, setPatterns] = useState<FirePatternData[]>(data);

  function add() {
    setPatterns((p) => [...p, { ...empty }]);
  }

  function remove(i: number) {
    setPatterns((p) => p.filter((_, idx) => idx !== i));
  }

  function update(i: number, field: keyof FirePatternData, value: string) {
    setPatterns((p) => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function handleNext() {
    onChange(patterns);
    onNext();
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex items-start gap-3 bg-authority-50 border border-authority-100 rounded-xl p-4">
        <Info className="w-4 h-4 text-authority-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-authority-800">NFPA 921 §6 — Fire Pattern Analysis</p>
          <p className="text-xs text-authority-600 mt-0.5">Document all observed fire patterns. Patterns are essential for origin determination. Record V-patterns, char depth, pour patterns, and heat indicators systematically.</p>
        </div>
      </div>

      {patterns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
          <Flame className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm font-medium">No fire patterns documented yet</p>
          <p className="text-xs mt-1">Add patterns to support origin determination</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={add}>
            <Plus className="w-3.5 h-3.5" />
            Add First Pattern
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {patterns.map((pattern, i) => {
            const typeInfo = FIRE_PATTERN_TYPES.find((t) => t.type === pattern.patternType);
            return (
              <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Pattern #{i + 1}</span>
                  <button
                    onClick={() => remove(i)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Pattern Type <span className="text-red-500">*</span></Label>
                    <Select
                      value={pattern.patternType}
                      onValueChange={(v) => {
                        update(i, "patternType", v);
                        const info = FIRE_PATTERN_TYPES.find((t) => t.type === v);
                        if (info) update(i, "nfpaSection", info.section);
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FIRE_PATTERN_TYPES.map((t) => (
                          <SelectItem key={t.type} value={t.type}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {typeInfo && (
                      <p className="text-xs text-slate-500">{typeInfo.description}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Location <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g., Living room NW corner, floor to ceiling"
                      value={pattern.location}
                      onChange={(e) => update(i, "location", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Char Depth (mm)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Depth in millimeters"
                      value={pattern.charDepth}
                      onChange={(e) => update(i, "charDepth", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Heat Indicators</Label>
                    <Input
                      placeholder="Melted wiring, glass, aluminum..."
                      value={pattern.heatIndicators}
                      onChange={(e) => update(i, "heatIndicators", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    placeholder="Describe the pattern in detail — shape, dimensions, directionality, associated damage..."
                    rows={2}
                    value={pattern.description}
                    onChange={(e) => update(i, "description", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Investigative Significance</Label>
                  <Input
                    placeholder="What does this pattern indicate about fire origin or behavior?"
                    value={pattern.significance}
                    onChange={(e) => update(i, "significance", e.target.value)}
                  />
                </div>

                {pattern.nfpaSection && (
                  <div className="flex items-center gap-1.5 text-xs text-authority-600 bg-authority-50 px-2.5 py-1.5 rounded-lg w-fit">
                    <Info className="w-3 h-3" />
                    {pattern.nfpaSection}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {patterns.length > 0 && (
        <Button variant="outline" size="sm" onClick={add} className="w-full border-dashed">
          <Plus className="w-3.5 h-3.5" />
          Add Another Pattern
        </Button>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext}>Continue — Evidence</Button>
      </div>
    </div>
  );
}
