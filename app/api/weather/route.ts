import { NextRequest, NextResponse } from "next/server";

// ─── Shared helpers ────────────────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mapConditions(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("thunder") || t.includes("storm")) return "Thunderstorm";
  if (t.includes("rain") || t.includes("shower") || t.includes("drizzle")) return "Rain";
  if (t.includes("fog") || t.includes("mist")) return "Fog";
  if (t.includes("snow") || t.includes("hail")) return "Snow";
  if (t.includes("overcast")) return "Overcast";
  if (t.includes("cloud")) return "Partly Cloudy";
  if (t.includes("wind")) return "High Wind";
  return "Clear";
}

// ─── DPIRD (WA Dept of Primary Industries & Regional Development) ──────────

// Representative DPIRD stations across WA: [code, name, lat, lng]
const DPIRD_STATIONS: [string, string, number, number][] = [
  ["SerpentineRes", "Serpentine Reservoir",     -32.3833, 116.0000],
  ["Northam",       "Northam",                  -31.6514, 116.6719],
  ["Merredin",      "Merredin",                 -31.4833, 118.2667],
  ["Moora",         "Moora",                    -30.6436, 116.0069],
  ["Wongan",        "Wongan Hills",              -30.8917, 116.7167],
  ["Newdegate",     "Newdegate",                -33.1,    119.0333],
  ["Esperance",     "Esperance",                -33.8500, 121.8833],
  ["Katanning",     "Katanning",                -33.6900, 117.5500],
  ["Manjimup",      "Manjimup",                 -34.2436, 116.1478],
  ["Geraldton",     "Geraldton",                -28.7956, 114.6972],
  ["Carnarvon",     "Carnarvon",                -24.8833, 113.6667],
  ["Meekatharra",   "Meekatharra",              -26.5950, 118.4900],
  ["Kalgoorlie",    "Kalgoorlie",               -30.7833, 121.4500],
  ["Narrogin",      "Narrogin",                 -32.9333, 117.1667],
  ["Collie",        "Collie",                   -33.3571, 116.1561],
  ["BruceRock",     "Bruce Rock",               -31.8833, 118.1500],
  ["Corrigin",      "Corrigin",                 -32.3333, 117.8667],
  ["Kojonup",       "Kojonup",                  -33.8333, 117.1500],
  ["Dumbleyung",    "Dumbleyung",               -33.3000, 117.7333],
  ["Jerramungup",   "Jerramungup",              -33.9500, 119.8000],
];

async function fetchDPIRD(lat: number, lng: number, apiKey: string) {
  // Find nearest DPIRD station
  const station = DPIRD_STATIONS.reduce((best, s) =>
    haversine(lat, lng, s[2], s[3]) < haversine(lat, lng, best[2], best[3]) ? s : best
  );
  const [code, name, sLat, sLng] = station;
  const distanceKm = Math.round(haversine(lat, lng, sLat, sLng));

  // Fetch last 30-minute summary
  const now = new Date();
  const start = new Date(now.getTime() - 60 * 60 * 1000); // 1 hr ago
  const fmt = (d: Date) => d.toISOString().slice(0, 19);

  const url = new URL(`https://api.dpird.wa.gov.au/v2/weather/stations/${code}/summaries/30min`);
  url.searchParams.set("start", fmt(start));
  url.searchParams.set("end", fmt(now));
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("select", "airTemperature,relativeHumidity,windAvgSpeed,windAvgDirection,rainfall,period");

  const res = await fetch(url.toString(), {
    next: { revalidate: 600 },
    headers: { "User-Agent": "FireTrace Pro / Fire Investigation" },
  });

  if (!res.ok) throw new Error(`DPIRD API error: ${res.status}`);
  const json = await res.json();

  // Latest record is last in array
  const records: Array<Record<string, unknown>> = json?.collection ?? json?.data ?? [];
  if (!records.length) throw new Error("No DPIRD data returned");

  const latest = records[records.length - 1];
  const airTemp = latest.airTemperature as { avg?: number } | number | null;
  const humidity = latest.relativeHumidity as { avg?: number } | number | null;
  const windSpeed = latest.windAvgSpeed as { avg?: number } | number | null;
  const windDir = latest.windAvgDirection as { avg?: number } | number | null;

  const getVal = (v: unknown) =>
    typeof v === "object" && v !== null && "avg" in v
      ? (v as { avg: number }).avg
      : (v as number | null);

  const windDirDeg = getVal(windDir);
  const windDirStr = windDirDeg != null ? degToCompass(windDirDeg) : null;

  return {
    station: name,
    stationCode: code,
    distanceKm,
    temperature: getVal(airTemp),
    humidity: getVal(humidity),
    windSpeedKmh: getVal(windSpeed),
    windDirection: windDirStr,
    conditions: "Clear", // DPIRD doesn't provide cloud/weather description
    source: "DPIRD WA",
  };
}

function degToCompass(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

// ─── BOM (Bureau of Meteorology) fallback ─────────────────────────────────

const BOM_STATIONS: [string, string, number, number][] = [
  ["94608", "Perth",             -31.9675, 115.9673],
  ["94610", "Perth Airport",     -31.9333, 115.9667],
  ["94601", "Fremantle",         -32.0561, 115.7494],
  ["94612", "Jandakot",          -32.0975, 115.8806],
  ["94618", "Armadale",          -32.1500, 116.0167],
  ["94602", "Swanbourne",        -31.9500, 115.7667],
  ["94627", "Mandurah",          -32.5833, 115.7333],
  ["94611", "Gingin",            -31.4667, 115.9000],
  ["94690", "Rottnest Island",   -32.0056, 115.5225],
  ["94659", "Bunbury",           -33.3333, 115.6333],
  ["94672", "Kalgoorlie-Boulder",-30.7833, 121.4500],
  ["94203", "Geraldton",         -28.7956, 114.6972],
  ["94315", "Albany",            -34.9403, 117.8008],
  ["94638", "Welshpool",         -31.9833, 115.9667],
];

const BOM_PRODUCTS = ["IDW60901", "IDW60903", "IDW60920"];

async function fetchBOM(lat: number, lng: number) {
  const station = BOM_STATIONS.reduce((best, s) =>
    haversine(lat, lng, s[2], s[3]) < haversine(lat, lng, best[2], best[3]) ? s : best
  );
  const [stationId, stationName, sLat, sLng] = station;
  const distanceKm = Math.round(haversine(lat, lng, sLat, sLng));

  for (const product of BOM_PRODUCTS) {
    try {
      const url = `http://www.bom.gov.au/fwo/${product}/${product}.${stationId}.json`;
      const res = await fetch(url, {
        next: { revalidate: 600 },
        headers: { "User-Agent": "FireTrace Pro / Fire Investigation" },
      });
      if (!res.ok) continue;
      const json = await res.json();
      const obs = json?.observations?.data?.[0];
      if (!obs) continue;

      return {
        station: stationName,
        stationId,
        distanceKm,
        observedAt: obs.local_date_time_full,
        temperature: obs.air_temp,
        humidity: obs.rel_hum,
        windSpeedKmh: obs.wind_spd_kmh,
        windDirection: obs.wind_dir,
        conditions: mapConditions(`${obs.cloud ?? ""} ${obs.weather ?? ""}`),
        apparentTemp: obs.apparent_t,
        dewPoint: obs.dewpt,
        pressureMsl: obs.press_msl,
        gustKmh: obs.gust_kmh,
        source: `BOM ${product}`,
      };
    } catch {
      continue;
    }
  }

  throw new Error(`No BOM data for nearest station (${stationName}, ${distanceKm}km)`);
}

// ─── Route handler ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const dpirdKey = process.env.DPIRD_API_KEY;

  // Try DPIRD first if key is configured
  if (dpirdKey) {
    try {
      const data = await fetchDPIRD(lat, lng, dpirdKey);
      return NextResponse.json(data);
    } catch {
      // fall through to BOM
    }
  }

  // Fall back to BOM (no key needed)
  try {
    const data = await fetchBOM(lat, lng);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
