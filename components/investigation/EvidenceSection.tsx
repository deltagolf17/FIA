"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignatureCapture } from "./SignatureCapture";
import { EvidenceQRLabel } from "./EvidenceQRLabel";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import { Package, QrCode, PenLine, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";

interface CustodyEntry {
  id: string;
  handledBy: string;
  action: string;
  timestamp: Date;
  notes: string | null;
  signature: string | null;
}

interface EvidenceItem {
  id: string;
  itemNumber: string;
  description: string;
  location: string;
  collectedBy: string;
  collectedAt: Date;
  condition: string | null;
  labSubmitted: boolean;
  notes: string | null;
  chainOfCustody: CustodyEntry[];
  investigationId: string;
  caseNumber: string;
}

const CUSTODY_ACTIONS = ["RECEIVED", "TRANSFERRED", "SUBMITTED_TO_LAB", "RETURNED", "DESTROYED"];

const ACTION_COLORS: Record<string, string> = {
  COLLECTED:        "bg-blue-100 text-blue-700",
  RECEIVED:         "bg-authority-100 text-authority-700",
  TRANSFERRED:      "bg-orange-100 text-orange-700",
  SUBMITTED_TO_LAB: "bg-purple-100 text-purple-700",
  RETURNED:         "bg-green-100 text-green-700",
  DESTROYED:        "bg-red-100 text-red-700",
};

export function EvidenceSection({ items }: { items: EvidenceItem[] }) {
  const router = useRouter();
  const [showQR, setShowQR] = useState(false);
  const [sigFor, setSigFor]   = useState<string | null>(null);
  const [sigAction, setSigAction] = useState("TRANSFERRED");
  const [saving, setSaving] = useState(false);

  async function addCustody(evidenceId: string, action: string, signature?: string) {
    setSaving(true);
    try {
      await fetch("/api/evidence", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidenceId, action, signature }),
      });
      router.refresh();
    } finally {
      setSaving(false);
      setSigFor(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No evidence items recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* QR Label print section */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Evidence & Chain of Custody ({items.length} items)
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowQR((v) => !v)} className="gap-1.5">
          <QrCode className="w-3.5 h-3.5" />
          {showQR ? "Hide" : "Print QR Labels"}
        </Button>
      </div>

      {showQR && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <EvidenceQRLabel items={items} />
        </div>
      )}

      {/* Evidence cards */}
      <div className="space-y-3">
        {items.map((e) => (
          <Card key={e.id}>
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-authority-800">{e.itemNumber}</span>
                    {e.labSubmitted && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Lab Submitted
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-sm text-slate-900">{e.description}</p>
                  {e.location && <p className="text-xs text-slate-500 mt-0.5">📍 {e.location}</p>}
                  {e.condition && <p className="text-xs text-slate-500">Condition: {e.condition}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">{formatDate(e.collectedAt)}</p>
                  <p className="text-xs text-slate-400">by {e.collectedBy}</p>
                </div>
              </div>

              {/* Chain of custody timeline */}
              {e.chainOfCustody.length > 0 && (
                <div className="mb-3 pl-3 border-l-2 border-slate-200 space-y-2">
                  {e.chainOfCustody.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-authority-400 mt-1.5 shrink-0 -ml-[0.3125rem]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            "text-xs font-semibold px-1.5 py-0.5 rounded",
                            ACTION_COLORS[entry.action] ?? "bg-slate-100 text-slate-600"
                          )}>
                            {entry.action.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-slate-600">{entry.handledBy}</span>
                          <span className="text-xs text-slate-400">{formatDateTime(entry.timestamp)}</span>
                        </div>
                        {entry.notes && <p className="text-xs text-slate-500 mt-0.5">{entry.notes}</p>}
                        {entry.signature && (
                          <img
                            src={entry.signature}
                            alt="Signature"
                            className="mt-1 h-8 border border-slate-200 rounded"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add custody action */}
              {sigFor === e.id ? (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="mb-3 flex items-center gap-2">
                    <select
                      value={sigAction}
                      onChange={(ev) => setSigAction(ev.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700"
                    >
                      {CUSTODY_ACTIONS.map((a) => (
                        <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  <SignatureCapture
                    onCapture={(dataUrl) => addCustody(e.id, sigAction, dataUrl)}
                    onCancel={() => setSigFor(null)}
                  />
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 gap-1.5 text-xs"
                  onClick={() => setSigFor(e.id)}
                  disabled={saving}
                >
                  {saving && sigFor === e.id
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <PenLine className="w-3 h-3" />
                  }
                  Add Custody Entry
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
