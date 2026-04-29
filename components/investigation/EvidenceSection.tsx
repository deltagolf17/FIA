"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignatureCapture } from "./SignatureCapture";
import { EvidenceQRLabel } from "./EvidenceQRLabel";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import {
  Package, QrCode, PenLine, CheckCircle2, Loader2,
  Plus, X, Camera, Upload, Trash2, Sparkles,
} from "lucide-react";
import { PhotoAnalysisModal } from "./PhotoAnalysisModal";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";

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
  photoUrls?: string;
  chainOfCustody: CustodyEntry[];
  investigationId: string;
  caseNumber: string;
  structureType?: string;
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

function parsePhotos(raw?: string): string[] {
  try { return JSON.parse(raw ?? "[]"); } catch { return []; }
}


function nextItemNumber(items: EvidenceItem[]): string {
  return `E-${String(items.length + 1).padStart(3, "0")}`;
}

interface AddFormState {
  description: string;
  location: string;
  itemNumber: string;
  condition: string;
  notes: string;
}

function AddEvidenceForm({
  investigationId,
  defaultItemNumber,
  onSaved,
  onCancel,
}: {
  investigationId: string;
  defaultItemNumber: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AddFormState>({
    description: "",
    location: "",
    itemNumber: defaultItemNumber,
    condition: "",
    notes: "",
  });
  const [photos, setPhotos]     = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("evidencePhoto");

  function set(field: keyof AddFormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFiles(files: FileList | File[] | null) {
    if (!files) return;
    const newFiles = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 5 - photos.length);
    if (!newFiles.length) return;
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...newFiles]);
    setPreviews((p) => [...p, ...urls]);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }
  function onDragLeave() { setDragging(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }

  function removePhoto(i: number) {
    URL.revokeObjectURL(previews[i]);
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.location.trim())    { setError("Location is required.");    return; }
    setError("");
    setSubmitting(true);
    try {
      let photoUrlsJson = "[]";
      if (photos.length > 0) {
        const uploaded = await startUpload(photos);
        if (!uploaded) throw new Error("Photo upload failed — ensure UPLOADTHING_SECRET is configured.");
        photoUrlsJson = JSON.stringify(uploaded.map((f) => f.ufsUrl));
        previews.forEach((url) => URL.revokeObjectURL(url));
      }
      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investigationId,
          itemNumber:  form.itemNumber.trim()  || defaultItemNumber,
          description: form.description.trim(),
          location:    form.location.trim(),
          condition:   form.condition.trim()   || null,
          notes:       form.notes.trim()       || null,
          photoUrls:   photoUrlsJson,
        }),
      });
      if (!res.ok) { setError("Failed to save evidence item."); return; }
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-authority-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-slate-700">New Evidence Item</p>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Row 1: item number + description */}
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Item #</label>
          <input
            value={form.itemNumber}
            onChange={(e) => set("itemNumber", e.target.value)}
            className={cn(inputClass, "font-mono")}
            placeholder="E-001"
          />
        </div>
        <div className="col-span-3">
          <label className="text-xs font-medium text-slate-500 block mb-1">Description <span className="text-red-500">*</span></label>
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputClass}
            placeholder="e.g. Charred electrical wire segment, ~30 cm"
          />
        </div>
      </div>

      {/* Row 2: location + condition */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Location / Collection Point <span className="text-red-500">*</span></label>
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className={inputClass}
            placeholder="e.g. NW corner, basement"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Condition</label>
          <input
            value={form.condition}
            onChange={(e) => set("condition", e.target.value)}
            className={inputClass}
            placeholder="e.g. Heavily charred, brittle"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className={cn(inputClass, "resize-none h-16")}
          placeholder="Additional observations, NFPA section references…"
        />
      </div>

      {/* Photo upload */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-2">
          <Camera className="w-3.5 h-3.5 inline mr-1" />Photos (up to 5)
        </label>
        {/* Drag-and-drop zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => photos.length < 5 && fileRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-3 transition-colors cursor-pointer mb-2",
            dragging
              ? "border-authority-400 bg-authority-50"
              : "border-slate-200 hover:border-authority-300 hover:bg-slate-50"
          )}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative group shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Photo ${i + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <div className="flex flex-col items-center justify-center text-slate-400 py-1 px-2">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-xs text-center leading-tight">
                  {dragging ? "Drop photos" : "Click or drag photos"}
                </span>
              </div>
            )}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={submitting || isUploading}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting || isUploading} className="gap-1.5">
          {(submitting || isUploading) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {isUploading ? "Uploading photos…" : submitting ? "Saving…" : "Save Evidence Item"}
        </Button>
      </div>
    </form>
  );
}

interface PhotoModalState {
  photos: string[];
  index: number;
  description: string;
  location: string;
}

export function EvidenceSection({
  items: initialItems,
  caseNumber: propCaseNumber,
  structureType,
}: {
  items: EvidenceItem[];
  caseNumber?: string;
  structureType?: string;
}) {
  const router = useRouter();
  const [items] = useState(initialItems);
  const [showQR, setShowQR] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sigFor, setSigFor] = useState<string | null>(null);
  const [sigAction, setSigAction] = useState("TRANSFERRED");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [photoModal, setPhotoModal] = useState<PhotoModalState | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this evidence item and all custody entries? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/evidence/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

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

  function handleSaved() {
    setShowForm(false);
    router.refresh();
  }

  if (items.length === 0 && !showForm) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
        <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm text-slate-500 mb-4">No evidence items recorded</p>
        <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Add First Evidence Item
        </Button>
      </div>
    );
  }

  const investigationId = items[0]?.investigationId ?? "";
  const caseNumber = propCaseNumber ?? items[0]?.caseNumber ?? "";

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Evidence & Chain of Custody ({items.length} item{items.length !== 1 ? "s" : ""})
        </h3>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setShowQR((v) => !v)} className="gap-1.5">
              <QrCode className="w-3.5 h-3.5" />
              {showQR ? "Hide QR" : "Print QR Labels"}
            </Button>
          )}
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add Evidence
            </Button>
          )}
        </div>
      </div>

      {/* QR labels panel */}
      {showQR && items.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <EvidenceQRLabel items={items} />
        </div>
      )}

      {/* Add evidence inline form */}
      {showForm && (
        <AddEvidenceForm
          investigationId={investigationId}
          defaultItemNumber={nextItemNumber(items)}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Photo AI analysis modal */}
      {photoModal && (
        <PhotoAnalysisModal
          photos={photoModal.photos}
          initialIndex={photoModal.index}
          evidenceDescription={photoModal.description}
          evidenceLocation={photoModal.location}
          caseNumber={caseNumber}
          structureType={structureType}
          onClose={() => setPhotoModal(null)}
        />
      )}

      {/* Evidence cards */}
      <div className="space-y-3">
        {items.map((e) => {
          const photos = parsePhotos(e.photoUrls);
          return (
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
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="text-xs text-slate-500">{formatDate(e.collectedAt)}</p>
                    <p className="text-xs text-slate-400">by {e.collectedBy}</p>
                    <button
                      onClick={() => handleDelete(e.id)}
                      disabled={deleting === e.id}
                      className="mt-1 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                      title="Delete evidence item"
                    >
                      {deleting === e.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>

                {/* Photos */}
                {photos.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {photos.map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={src}
                          alt={`Evidence photo ${i + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 hover:border-authority-400 transition-all"
                          onClick={() =>
                            setPhotoModal({
                              photos,
                              index: i,
                              description: e.description,
                              location: e.location,
                            })
                          }
                        />
                      ))}
                      <span className="text-xs text-slate-400">{photos.length} photo{photos.length !== 1 ? "s" : ""}</span>
                    </div>
                    <button
                      onClick={() =>
                        setPhotoModal({
                          photos,
                          index: 0,
                          description: e.description,
                          location: e.location,
                        })
                      }
                      className="flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg transition-colors border border-orange-200"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Analyze with AI (NFPA 921)
                    </button>
                  </div>
                )}

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
                            // eslint-disable-next-line @next/next/no-img-element
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
          );
        })}
      </div>
    </div>
  );
}
