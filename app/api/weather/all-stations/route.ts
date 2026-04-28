import { NextResponse } from "next/server";

function degToCardinal(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

const WA_STATIONS: Array<{ code: string; name: string; lat: number; lon: number }> = [
  { code: "SerpentineRes", name: "Serpentine",    lat: -32.3833, lon: 116.0000 },
  { code: "Northam",       name: "Northam",       lat: -31.6514, lon: 116.6719 },
  { code: "Merredin",      name: "Merredin",      lat: -31.4833, lon: 118.2667 },
  { code: "Moora",         name: "Moora",         lat: -30.6436, lon: 116.0069 },
  { code: "Wongan",        name: "Wongan Hills",  lat: -30.8917, lon: 116.7167 },
  { code: "Newdegate",     name: "Newdegate",     lat: -33.1000, lon: 119.0333 },
  { code: "Esperance",     name: "Esperance",     lat: -33.8500, lon: 121.8833 },
  { code: "Katanning",     name: "Katanning",     lat: -33.6900, lon: 117.5500 },
  { code: "Manjimup",      name: "Manjimup",      lat: -34.2436, lon: 116.1478 },
  { code: "Geraldton",     name: "Geraldton",     lat: -28.7956, lon: 114.6972 },
  { code: "Carnarvon",     name: "Carnarvon",     lat: -24.8833, lon: 113.6667 },
  { code: "Meekatharra",   name: "Meekatharra",   lat: -26.5950, lon: 118.4900 },
  { code: "Kalgoorlie",    name: "Kalgoorlie",    lat: -30.7833, lon: 121.4500 },
  { code: "Narrogin",      name: "Narrogin",      lat: -32.9333, lon: 117.1667 },
  { code: "Collie",        name: "Collie",        lat: -33.3571, lon: 116.1561 },
  { code: "BruceRock",     name: "Bruce Rock",    lat: -31.8833, lon: 118.1500 },
  { code: "Corrigin",      name: "Corrigin",      lat: -32.3333, lon: 117.8667 },
  { code: "Kojonup",       name: "Kojonup",       lat: -33.8333, lon: 117.1500 },
  { code: "Dumbleyung",    name: "Dumbleyung",    lat: -33.3000, lon: 117.7333 },
  { code: "Jerramungup",   name: "Jerramungup",   lat: -33.9500, lon: 119.8000 },
];

interface StationResult {
  code: string;
  name: string;
  lat: number;
  lon: number;
  temperatureC: number | null;
  humidityPct: number | null;
  windSpeedKmh: number | null;
  windGustsKmh: number | null;
  windDirectionDegrees: number | null;
  windDirectionCardinal: string | null;
  observedAt: string | null;
}

async function fetchStation(code: string, apiKey: string): Promise<Omit<StationResult, "code" | "name" | "lat" | "lon">> {
  const now = new Date();
  const start = new Date(now.getTime() - 90 * 60 * 1000); // 90 min window
  const fmt = (d: Date) => d.toISOString().slice(0, 19);

  const url = new URL(`https://api.dpird.wa.gov.au/v2/weather/stations/${code}/summaries/30min`);
  url.searchParams.set("start", fmt(start));
  url.searchParams.set("end", fmt(now));
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("select", "airTemperature,relativeHumidity,windAvgSpeed,windAvgDirection,windGustMax,period");

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`DPIRD ${code}: ${res.status}`);

  const json = await res.json();
  const records: Array<Record<string, unknown>> = json.collection ?? json.data ?? [];
  const latest = records[records.length - 1];

  const getAvg = (v: unknown): number | null => {
    if (v == null) return null;
    if (typeof v === "number") return v;
    if (typeof v === "object" && "avg" in (v as object)) return (v as { avg: number }).avg;
    return null;
  };

  const windDeg = getAvg(latest?.windAvgDirection);
  return {
    temperatureC: getAvg(latest?.airTemperature),
    humidityPct: getAvg(latest?.relativeHumidity),
    windSpeedKmh: getAvg(latest?.windAvgSpeed),
    windGustsKmh: getAvg((latest as Record<string, unknown>)?.windGustMax),
    windDirectionDegrees: windDeg,
    windDirectionCardinal: windDeg != null ? degToCardinal(windDeg) : null,
    observedAt: latest?.period as string ?? null,
  };
}

export async function GET() {
  const apiKey = process.env.DPIRD_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ stations: [], error: "DPIRD_API_KEY not configured" }, { status: 503 });
  }

  const results: StationResult[] = await Promise.all(
    WA_STATIONS.map(async (st): Promise<StationResult> => {
      try {
        const obs = await fetchStation(st.code, apiKey);
        return { code: st.code, name: st.name, lat: st.lat, lon: st.lon, ...obs };
      } catch {
        return {
          code: st.code, name: st.name, lat: st.lat, lon: st.lon,
          temperatureC: null, humidityPct: null,
          windSpeedKmh: null, windGustsKmh: null,
          windDirectionDegrees: null, windDirectionCardinal: null,
          observedAt: null,
        };
      }
    })
  );

  return NextResponse.json({ stations: results, fetchedAt: new Date().toISOString() });
}
