export type IncidentType =
  | "STRUCTURE_FIRE"
  | "VEHICLE_FIRE"
  | "VEGETATION_FIRE"
  | "HAZMAT"
  | "RESCUE"
  | "ALARM"
  | "OTHER";

export interface LiveIncident {
  id: string;
  type: IncidentType;
  rawType: string;
  status: "active" | "open" | "closed";
  startDate: string;        // ISO 8601
  lastUpdated: string;      // ISO 8601
  address: string;
  suburb: string;
  lga: string;
  lat: number | null;
  lon: number | null;
  fdrDistrict: string;
  fdrRating: string;
  fdrIndex: number | null;
  description?: string;
}

export type RegionFilter = "25km" | "50km" | "100km" | "250km" | "metro" | "wa";
export type FilterMode = "active" | "all_open";
export type DetailTab = "details" | "weather" | "channels";
export type WeatherMapMode = "wind" | "temperature";

export interface NearbyStation {
  stationCode: string;
  stationName: string;
  distanceKm: number;
  observedAt: string;
  temperatureC: number | null;
  humidityPct: number | null;
  windSpeedKmh: number | null;
  windGustsKmh: number | null;
  windDirectionDegrees: number | null;
  windDirectionCardinal: string | null;
  lat: number | null;
  lon: number | null;
}
