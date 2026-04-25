"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChecklistItem {
  id: string;
  category: string;
  requirement: string;
  nfpaSection: string;
  completed: boolean;
}

const CATEGORY_ORDER = ["SCENE", "DOCUMENTATION", "ORIGIN", "CAUSE", "REPORT"];
const CATEGORY_COLORS: Record<string, string> = {
  SCENE:         "text-blue-700 bg-blue-50 border-blue-100",
  DOCUMENTATION: "text-purple-700 bg-purple-50 border-purple-100",
  ORIGIN:        "text-orange-700 bg-orange-50 border-orange-100",
  CAUSE:         "text-red-700 bg-red-50 border-red-100",
  REPORT:        "text-green-700 bg-green-50 border-green-100",
};

export function InteractiveChecklist({ items }: { items: ChecklistItem[] }) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState(items);
  const [pending, startTransition] = useTransition();
  const [toggling, setToggling] = useState<string | null>(null);

  const total = localItems.length;
  const completed = localItems.filter((i) => i.completed).length;
  const score = total > 0 ? Math.round((completed / total) * 100) : 0;

  async function toggle(itemId: string, currentCompleted: boolean) {
    setToggling(itemId);
    setLocalItems((prev) =>
      prev.map((i) => i.id === itemId ? { ...i, completed: !currentCompleted } : i)
    );

    try {
      await fetch(`/api/checklist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      startTransition(() => router.refresh());
    } catch {
      setLocalItems((prev) =>
        prev.map((i) => i.id === itemId ? { ...i, completed: currentCompleted } : i)
      );
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Score summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-6">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700">NFPA 921 Compliance</span>
            <span className={cn(
              "font-bold",
              score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"
            )}>
              {completed}/{total} — {score}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
        <div className={cn(
          "text-2xl font-black px-4 py-2 rounded-xl",
          score >= 80 ? "text-green-700 bg-green-50" :
          score >= 50 ? "text-yellow-700 bg-yellow-50" : "text-red-700 bg-red-50"
        )}>
          {score}%
        </div>
      </div>

      {/* Categories */}
      {CATEGORY_ORDER.map((cat) => {
        const catItems = localItems.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        const catDone = catItems.filter((i) => i.completed).length;
        const colorClass = CATEGORY_COLORS[cat] ?? "text-slate-700 bg-slate-50 border-slate-100";

        return (
          <Card key={cat} className="overflow-hidden">
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold border", colorClass)}>
                    {cat}
                  </span>
                </CardTitle>
                <span className="text-xs text-slate-500">{catDone}/{catItems.length}</span>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1.5">
              {catItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id, item.completed)}
                  disabled={toggling === item.id}
                  className={cn(
                    "w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all",
                    item.completed
                      ? "bg-green-50 hover:bg-green-100"
                      : "bg-slate-50 hover:bg-slate-100",
                    "group"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {toggling === item.id ? (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    ) : item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs font-medium leading-snug",
                      item.completed ? "text-green-800" : "text-slate-700"
                    )}>
                      {item.requirement}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.nfpaSection}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
