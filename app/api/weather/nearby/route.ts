import { NextRequest, NextResponse } from "next/server";
import type { NearbyStation } from "@/types/incidents";

function degToCardinal(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Fallback: static DPIRD station coords for distance sorting when nearby API unavailable
const DPIRD_STATION_COORDS: Record<string, [number, number]> = {
  SerpentineRes: [-32.3833, 116.0000],
  Northam:       [-31.6514, 116.6719],
  Merredin:      [-31.4833, 118.2667],
  Moora:         [-30.6436, 116.0069],
  Wongan:        [-30.8917, 116.7167],
  Newdegate:     [-33.1000, 119.0333],
  Esperance:     [-33.8500, 121.8833],
  Katanning:     [-33.6900, 117.5500],
  Manjimup:      [-34.2436, 116.1478],
  Geraldton:     [-28.7956, 114.6972],
  Carnarvon:     [-24.8833, 113.6667],
  Kalgoorlie:    [-30.7833, 121.4500],
  Narrogin:      [-32.9333, 117.1667],
  Collie:        [-33.3571, 116.1561],
};

async function fetchDPIRDNearby(lat: number, lon: number, apiKey: string): Promise<NearbyStation[]> {
  // Get list of stations
  const stationsUrl = new URL("https://api.dpird.wa.gov.au/v2/weather/stations");
  stationsUrl.searchParams.set("api_key", apiKey);
  stationsUrl.searchParams.set("limit", "200");

  const stRes = await fetch(stationsUrl.toString(), { next: { revalidate: 3600 } });
  if (!stRes.ok) throw new Error(`DPIRD stations: ${stRes.status}`);
  const stJson = await stRes.json();

  interface DPIRDStation {
    stationCode: string;
    stationName: string;
    latitude: number;
    longitude: number;
  }

  const stations: DPIRDStation[] = stJson.collection ?? stJson.data ?? [];

  // Sort by distance, take 5 nearest
  const nearest = stations
    .filter((s) => s.latitude && s.longitude)
    .map((s) => ({ ...s, dist: haversine(lat, lon, s.latitude, s.longitude) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5);

  // Fetch observations for each
  const now = new Date();
  const start = new Date(now.getTime() - 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 19);

  const results: NearbyStation[] = await Promise.all(
    nearest.map(async (s): Promise<NearbyStation> => {
      try {
        const obsUrl = new URL(`https://api.dpird.wa.gov.au/v2/weather/stations/${s.stationCode}/summaries/30min`);
        obsUrl.searchParams.set("start", fmt(start));
        obsUrl.searchParams.set("end", fmt(now));
        obsUrl.searchParams.set("api_key", apiKey);
        obsUrl.searchParams.set("select", "airTemperature,relativeHumidity,windAvgSpeed,windAvgDirection,windGustMax,period");

        const obsRes = await fetch(obsUrl.toString(), { next: { revalidate: 300 } });
        if (!obsRes.ok) throw new Error("obs failed");

        const obsJson = await obsRes.json();
        const records: Array<Record<string, unknown>> = obsJson.collection ?? obsJson.data ?? [];
        const latest = records[records.length - 1];

        const getAvg = (v: unknown): number | null => {
          if (v == null) return null;
          if (typeof v === "number") return v;
          if (typeof v === "object" && "avg" in (v as object)) return (v as { avg: number }).avg;
          return null;
        };

        const windDeg = getAvg(latest?.windAvgDirection);

        return {
          stationCode: s.stationCode,
          stationName: s.stationName,
          distanceKm: Math.round(s.dist * 10) / 10,
          observedAt: latest?.period as string ?? now.toISOString(),
          temperatureC: getAvg(latest?.airTemperature),
          humidityPct: getAvg(latest?.relativeHumidity),
          windSpeedKmh: getAvg(latest?.windAvgSpeed),
          windGustsKmh: getAvg((latest as Record<string, unknown>)?.windGustMax),
          windDirectionDegrees: windDeg,
          windDirectionCardinal: windDeg != null ? degToCardinal(windDeg) : null,
          lat: s.latitude,
          lon: s.longitude,
        };
      } catch {
        return {
          stationCode: s.stationCode,
          stationName: s.stationName,
          distanceKm: Math.round(s.dist * 10) / 10,
          observedAt: now.toISOString(),
          temperatureC: null,
          humidityPct: null,
          windSpeedKmh: null,
          windGustsKmh: null,
          windDirectionDegrees: null,
          windDirectionCardinal: null,
          lat: s.latitude,
          lon: s.longitude,
        };
      }
    })
  );

  return results;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const dpirdKey = process.env.DPIRD_API_KEY;
  if (!dpirdKey) {
    return NextResponse.json({ stations: [], error: "DPIRD_API_KEY not configured" }, { status: 503 });
  }

  try {
    const stations = await fetchDPIRDNearby(lat, lon, dpirdKey);
    return NextResponse.json({ stations, fetchedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ stations: [], error: (e as Error).message }, { status: 500 });
  }
}
