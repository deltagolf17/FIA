export const NFPA_CAUSE_CODES = {
  NATURAL: {
    code: "NAT",
    label: "Natural",
    color: "green",
    description: "Fire caused by natural forces — lightning, earthquake, spontaneous heating",
    nfpaSection: "NFPA 921 §20.2",
  },
  ACCIDENTAL: {
    code: "ACC",
    label: "Accidental",
    color: "blue",
    description: "Unintentional human action or equipment failure — cooking, electrical, heating",
    nfpaSection: "NFPA 921 §20.3",
  },
  INCENDIARY: {
    code: "INC",
    label: "Incendiary",
    color: "red",
    description: "Fire intentionally set under circumstances where the fire should not be set",
    nfpaSection: "NFPA 921 §20.4",
  },
  UNDETERMINED: {
    code: "UND",
    label: "Undetermined",
    color: "yellow",
    description: "Cannot be determined — insufficient evidence or investigation is ongoing",
    nfpaSection: "NFPA 921 §20.5",
  },
} as const;

export const FIRE_PATTERN_TYPES = [
  { type: "V_PATTERN",      label: "V-Pattern",          section: "NFPA 921 §6.3.1",  description: "V or U-shaped char pattern indicating fire progression" },
  { type: "INVERTED_V",     label: "Inverted V-Pattern",  section: "NFPA 921 §6.3.2",  description: "Inverted V pattern indicating accelerant pour" },
  { type: "CHAR_DEPTH",     label: "Char Depth",          section: "NFPA 921 §6.3.3",  description: "Depth of charring indicating heat exposure duration" },
  { type: "HEAT_SHADOWING", label: "Heat Shadowing",      section: "NFPA 921 §6.3.4",  description: "Protected areas showing fire direction and intensity" },
  { type: "POUR_PATTERN",   label: "Pour Pattern",        section: "NFPA 921 §6.3.7",  description: "Irregular floor patterns suggesting liquid accelerant" },
  { type: "SMOKE_DEPOSIT",  label: "Smoke Deposit",       section: "NFPA 921 §6.3.5",  description: "Soot patterns indicating smoke travel and origin" },
  { type: "SPALLING",       label: "Spalling",            section: "NFPA 921 §6.3.6",  description: "Concrete/masonry surface fracturing from heat" },
  { type: "MELTING",        label: "Melting",             section: "NFPA 921 §6.3.8",  description: "Material melting indicating temperature thresholds" },
  { type: "CLEAN_BURN",     label: "Clean Burn",          section: "NFPA 921 §6.3.9",  description: "Area burned clean of soot suggesting intense heat or origin" },
  { type: "OTHER",          label: "Other Pattern",       section: "NFPA 921 §6.3",    description: "Other fire pattern not classified above" },
] as const;

export const STRUCTURE_TYPES = [
  { value: "RESIDENTIAL_SINGLE", label: "Single-Family Residential" },
  { value: "RESIDENTIAL_MULTI",  label: "Multi-Family Residential" },
  { value: "COMMERCIAL",         label: "Commercial / Business" },
  { value: "INDUSTRIAL",         label: "Industrial / Manufacturing" },
  { value: "VEHICLE",            label: "Vehicle" },
  { value: "WILDLAND",           label: "Wildland / Outdoor" },
  { value: "OTHER",              label: "Other" },
] as const;

export const CONSTRUCTION_TYPES = [
  { value: "TYPE_I",   label: "Type I — Fire Resistive" },
  { value: "TYPE_II",  label: "Type II — Non-Combustible" },
  { value: "TYPE_III", label: "Type III — Ordinary" },
  { value: "TYPE_IV",  label: "Type IV — Heavy Timber" },
  { value: "TYPE_V",   label: "Type V — Wood Frame" },
] as const;

export const OCCUPANCY_TYPES = [
  "Assembly",
  "Business",
  "Educational",
  "Factory/Industrial",
  "Hazardous",
  "Institutional",
  "Mercantile",
  "Residential (1-2 family)",
  "Residential (3+ family)",
  "Storage",
  "Utility/Misc",
  "Special Structure",
  "Unknown",
] as const;

export const IGNITION_SOURCES = [
  "Open flame",
  "Electrical arc/sparks",
  "Hot surface",
  "Radiated/conducted heat",
  "Cigarette/smoking material",
  "Cutting/welding",
  "Friction",
  "Lightning",
  "Spontaneous combustion",
  "Chemical reaction",
  "Ember/hot particle",
  "Static discharge",
  "Unknown",
] as const;

export const FIRST_MATERIALS = [
  "Upholstered furniture",
  "Mattress/bedding",
  "Floor covering",
  "Cabinetry/furniture",
  "Structural member",
  "Electrical insulation",
  "Cooking materials",
  "Clothing/apparel",
  "Gasoline/flammable liquid",
  "Grass/weeds/shrubs",
  "Paper/cardboard",
  "Trash/rubbish",
  "Unknown",
] as const;

export const NFPA921_CHECKLIST = [
  // Scene
  { id: "sc-1", category: "SCENE",         requirement: "Scene safety assessment completed",                  nfpaSection: "NFPA 921 §12.2" },
  { id: "sc-2", category: "SCENE",         requirement: "Legal authority/jurisdiction established",           nfpaSection: "NFPA 921 §12.3" },
  { id: "sc-3", category: "SCENE",         requirement: "Scene perimeter established and maintained",         nfpaSection: "NFPA 921 §12.4" },
  { id: "sc-4", category: "SCENE",         requirement: "Exterior examination completed before interior",     nfpaSection: "NFPA 921 §13.2" },
  // Documentation
  { id: "doc-1", category: "DOCUMENTATION", requirement: "Systematic photographic documentation",             nfpaSection: "NFPA 921 §13.3" },
  { id: "doc-2", category: "DOCUMENTATION", requirement: "Scene diagram/sketch prepared",                     nfpaSection: "NFPA 921 §13.4" },
  { id: "doc-3", category: "DOCUMENTATION", requirement: "Weather conditions documented",                     nfpaSection: "NFPA 921 §13.5" },
  { id: "doc-4", category: "DOCUMENTATION", requirement: "Witness interviews conducted and documented",       nfpaSection: "NFPA 921 §13.6" },
  { id: "doc-5", category: "DOCUMENTATION", requirement: "Evidence documented in place before collection",    nfpaSection: "NFPA 921 §15.2" },
  // Origin
  { id: "ori-1", category: "ORIGIN",        requirement: "Fire pattern analysis completed",                   nfpaSection: "NFPA 921 §14.2" },
  { id: "ori-2", category: "ORIGIN",        requirement: "Area of origin identified",                         nfpaSection: "NFPA 921 §14.3" },
  { id: "ori-3", category: "ORIGIN",        requirement: "Point of origin identified",                        nfpaSection: "NFPA 921 §14.4" },
  { id: "ori-4", category: "ORIGIN",        requirement: "Char depth measurements recorded",                  nfpaSection: "NFPA 921 §6.3.3" },
  { id: "ori-5", category: "ORIGIN",        requirement: "Utility systems examined at/near origin",           nfpaSection: "NFPA 921 §14.5" },
  // Cause
  { id: "cau-1", category: "CAUSE",         requirement: "First material ignited identified or hypothesized", nfpaSection: "NFPA 921 §20.1" },
  { id: "cau-2", category: "CAUSE",         requirement: "Ignition source identified or hypothesized",        nfpaSection: "NFPA 921 §20.1" },
  { id: "cau-3", category: "CAUSE",         requirement: "Ignition factor identified",                        nfpaSection: "NFPA 921 §20.1" },
  { id: "cau-4", category: "CAUSE",         requirement: "Alternative hypotheses considered and eliminated",  nfpaSection: "NFPA 921 §17.4" },
  // Report
  { id: "rep-1", category: "REPORT",        requirement: "Cause classification assigned per NFPA 921 §20",   nfpaSection: "NFPA 921 §20" },
  { id: "rep-2", category: "REPORT",        requirement: "Report includes origin determination methodology",  nfpaSection: "NFPA 921 §14" },
  { id: "rep-3", category: "REPORT",        requirement: "Evidence chain of custody documented",             nfpaSection: "NFPA 921 §15.3" },
  { id: "rep-4", category: "REPORT",        requirement: "Final report signed by certified investigator",    nfpaSection: "NFPA 1033 §4.7" },
] as const;

export function getCauseCodeColor(code: string): string {
  const map: Record<string, string> = {
    NATURAL:      "bg-green-100 text-green-800 border-green-200",
    ACCIDENTAL:   "bg-blue-100 text-blue-800 border-blue-200",
    INCENDIARY:   "bg-red-100 text-red-800 border-red-200",
    UNDETERMINED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return map[code] ?? "bg-gray-100 text-gray-800 border-gray-200";
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    OPEN:           "bg-blue-100 text-blue-800",
    IN_PROGRESS:    "bg-orange-100 text-orange-800",
    PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
    CLOSED:         "bg-green-100 text-green-800",
    ARCHIVED:       "bg-gray-100 text-gray-600",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}

export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `FIA-${year}-${rand}`;
}
