"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditInvestigationModal } from "./EditInvestigationModal";

interface Investigation {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  incidentDate: Date | string;
  structureType: string | null;
  occupancyType: string | null;
  constructionType: string | null;
  buildingAge: number | null;
  numStories: number | null;
  weatherConditions: string | null;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: string | null;
  utilitiesGas: string | null;
  utilitiesElectric: string | null;
  utilitiesWater: string | null;
  areaOfOrigin: string | null;
  pointOfOrigin: string | null;
  causeCode: string | null;
  causeNarrative: string | null;
  firstMaterialIgnited: string | null;
  ignitionSource: string | null;
  ignitionFactor: string | null;
  fuelPackage: string | null;
  fireSpread: string | null;
  determination: string | null;
}

export function EditInvestigationButton({ investigation }: { investigation: Investigation }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5">
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </Button>
      {open && <EditInvestigationModal investigation={investigation} onClose={() => setOpen(false)} />}
    </>
  );
}
