import { z } from "zod";

export const incidentBasicsSchema = z.object({
  incidentDate: z.string().min(1, "Incident date is required"),
  dispatchTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required").max(2),
  zip: z.string().min(5, "ZIP code is required"),
  occupancyType: z.string().min(1, "Occupancy type is required"),
  notes: z.string().optional(),
});

export const sceneConditionSchema = z.object({
  structureType: z.string().min(1, "Structure type is required"),
  numStories: z.string().optional(),
  constructionType: z.string().optional(),
  buildingAge: z.string().optional(),
  weatherConditions: z.string().optional(),
  windSpeed: z.string().optional(),
  windDirection: z.string().optional(),
  temperature: z.string().optional(),
  humidity: z.string().optional(),
  utilitiesGas: z.enum(["ON", "OFF", "UNKNOWN"]).default("UNKNOWN"),
  utilitiesElectric: z.enum(["ON", "OFF", "UNKNOWN"]).default("UNKNOWN"),
  utilitiesWater: z.enum(["ON", "OFF", "UNKNOWN"]).default("UNKNOWN"),
});

export const originSchema = z.object({
  areaOfOrigin: z.string().min(1, "Area of origin is required (NFPA 921 §14.3)"),
  pointOfOrigin: z.string().optional(),
  originNarrative: z.string().min(10, "Origin narrative must be at least 10 characters"),
  methodology: z.string().min(1, "Methodology is required"),
});

export const causeSchema = z.object({
  firstMaterialIgnited: z.string().min(1, "First material ignited is required (NFPA 921 §20.1)"),
  ignitionSource: z.string().min(1, "Ignition source is required (NFPA 921 §20.1)"),
  ignitionFactor: z.string().optional(),
  fuelPackage: z.string().optional(),
  fireSpread: z.string().optional(),
});

export const determinationSchema = z.object({
  causeCode: z.enum(["NATURAL", "ACCIDENTAL", "INCENDIARY", "UNDETERMINED"], {
    required_error: "NFPA 921 cause classification is required",
  }),
  causeNarrative: z.string().min(20, "Cause narrative must be at least 20 characters"),
  determination: z.string().min(1, "Determination statement is required"),
  recommendations: z.string().optional(),
});

export const evidenceItemSchema = z.object({
  itemNumber: z.string().min(1, "Item number is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  condition: z.string().optional(),
  notes: z.string().optional(),
});
