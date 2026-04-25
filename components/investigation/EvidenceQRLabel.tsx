"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface EvidenceItem {
  id: string;
  itemNumber: string;
  description: string;
  location: string;
  collectedBy: string;
  investigationId: string;
  caseNumber: string;
}

interface EvidenceQRLabelProps {
  items: EvidenceItem[];
  baseUrl?: string;
}

export function EvidenceQRLabel({ items, baseUrl = "https://firetrace.app" }: EvidenceQRLabelProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Evidence-Labels-${items[0]?.caseNumber ?? ""}`,
  });

  return (
    <div>
      <Button size="sm" variant="outline" onClick={() => handlePrint()} className="gap-1.5 no-print mb-4">
        <Printer className="w-3.5 h-3.5" />
        Print QR Labels ({items.length})
      </Button>

      <div ref={printRef} className="grid grid-cols-3 gap-3 p-4">
        {items.map((item) => {
          const url = `${baseUrl}/investigations/${item.investigationId}/evidence/${item.id}`;
          return (
            <div
              key={item.id}
              className="border-2 border-slate-800 rounded-lg p-3 flex flex-col items-center gap-2 bg-white"
              style={{ width: "160px", breakInside: "avoid" }}
            >
              <div className="w-full flex justify-between items-start">
                <div>
                  <p className="font-mono text-xs font-bold text-authority-900 leading-none">{item.caseNumber}</p>
                  <p className="font-mono text-sm font-black text-slate-900 mt-0.5">{item.itemNumber}</p>
                </div>
                <div className="w-6 h-6 bg-fire-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">FT</span>
                </div>
              </div>

              <QRCodeSVG
                value={url}
                size={80}
                level="M"
                includeMargin={false}
                fgColor="#172554"
              />

              <div className="w-full text-center">
                <p className="text-xs text-slate-600 truncate leading-tight">{item.description}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">📍 {item.location}</p>
              </div>

              <div className="w-full border-t border-dashed border-slate-300 pt-1.5">
                <p className="text-xs text-slate-400 text-center">FireTrace Pro · NFPA 921</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
