export type UserRole =
  | "FIREFIGHTER"
  | "INVESTIGATOR"
  | "SUPERVISOR"
  | "INSURANCE_ADJUSTER"
  | "ADMIN";

export type InvestigationStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "PENDING_REVIEW"
  | "CLOSED"
  | "ARCHIVED";

export type NFPACauseCode =
  | "NATURAL"
  | "ACCIDENTAL"
  | "INCENDIARY"
  | "UNDETERMINED";

export type PatternType =
  | "V_PATTERN"
  | "INVERTED_V"
  | "CHAR_DEPTH"
  | "HEAT_SHADOWING"
  | "POUR_PATTERN"
  | "SMOKE_DEPOSIT"
  | "SPALLING"
  | "MELTING"
  | "CLEAN_BURN"
  | "OTHER";

export type ClaimStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "DENIED"
  | "CLOSED";

export interface NFPAChecklistItem {
  id: string;
  category: "SCENE" | "DOCUMENTATION" | "ORIGIN" | "CAUSE" | "REPORT";
  requirement: string;
  nfpaSection: string;
  completed: boolean;
  notes?: string;
}

export interface WizardState {
  step: number;
  incidentBasics: IncidentBasicsData;
  sceneCondition: SceneConditionData;
  firePatterns: FirePatternData[];
  evidence: EvidenceData[];
  originDetermination: OriginData;
  causeClassification: CauseData;
  finalDetermination: DeterminationData;
}

export interface IncidentBasicsData {
  incidentDate: string;
  dispatchTime: string;
  arrivalTime: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  occupancyType: string;
  notes: string;
}

export interface SceneConditionData {
  structureType: string;
  numStories: string;
  constructionType: string;
  buildingAge: string;
  weatherConditions: string;
  windSpeed: string;
  windDirection: string;
  temperature: string;
  humidity: string;
  utilitiesGas: string;
  utilitiesElectric: string;
  utilitiesWater: string;
}

export interface FirePatternData {
  patternType: PatternType;
  location: string;
  description: string;
  charDepth: string;
  heatIndicators: string;
  nfpaSection: string;
  significance: string;
}

export interface EvidenceData {
  itemNumber: string;
  description: string;
  location: string;
  condition: string;
  notes: string;
}

export interface OriginData {
  areaOfOrigin: string;
  pointOfOrigin: string;
  originNarrative: string;
  methodology: string;
}

export interface CauseData {
  firstMaterialIgnited: string;
  ignitionSource: string;
  ignitionFactor: string;
  fuelPackage: string;
  fireSpread: string;
}

export interface DeterminationData {
  causeCode: NFPACauseCode | "";
  causeNarrative: string;
  determination: string;
  recommendations: string;
}

export interface DashboardKPI {
  label: string;
  value: number | string;
  delta?: number;
  deltaLabel?: string;
  icon: string;
  color: "blue" | "orange" | "green" | "red" | "yellow";
}

export interface CauseTrendPoint {
  month: string;
  NATURAL: number;
  ACCIDENTAL: number;
  INCENDIARY: number;
  UNDETERMINED: number;
}
