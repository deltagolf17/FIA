"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check } from "lucide-react";

interface SignatureCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

export function SignatureCapture({ onCapture, onCancel }: SignatureCaptureProps) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  function clear() {
    sigRef.current?.clear();
    setIsEmpty(true);
  }

  function confirm() {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    onCapture(dataUrl);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Sign below to confirm chain of custody transfer</p>
      <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white">
        <SignatureCanvas
          ref={sigRef}
          canvasProps={{ width: 480, height: 140, className: "w-full" }}
          penColor="#1e3a8a"
          onBegin={() => setIsEmpty(false)}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={clear} className="gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </Button>
        <Button size="sm" onClick={confirm} disabled={isEmpty} className="gap-1.5">
          <Check className="w-3.5 h-3.5" />
          Confirm Signature
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
