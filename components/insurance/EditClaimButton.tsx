"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { EditClaimModal } from "./EditClaimModal";

interface Claim {
  id: string;
  adjusterName: string | null;
  adjusterEmail: string | null;
  estimatedLoss: number | null;
  finalLoss: number | null;
  notes: string | null;
}

export function EditClaimButton({ claim }: { claim: Claim }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5 text-xs">
        <Edit3 className="w-3.5 h-3.5" />
        Edit
      </Button>
      {open && <EditClaimModal claim={claim} onClose={() => setOpen(false)} />}
    </>
  );
}
