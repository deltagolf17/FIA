import { NextRequest, NextResponse } from "next/server";

// Major WA BOM stations: [id, name, lat, lng]
const WA_STATIONS: [string, string, number, number][] = [
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
  ["94638", "Welshpool",         -31.9833, 115.9667],
  ["94672", "Kalgoorlie-Boulder",-30.7833, 121.4500],
  ["94203", "Geraldton",         -28.7956, 114.6972],
  ["94315", "Albany",            -34.9403, 117.8008],
];

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

function nearestStation(lat: number, lng: number) {
  return WA_STATIONS.reduce((best, s) =>
    haversine(lat, lng, s[2], s[3]) < haversine(lat, lng, best[2], best[3]) ? s : best
  );
}

function mapConditions(cloud: string, weather: string): string {
  const text = `${cloud} ${weather}`.toLowerCase();
  if (text.includes("thunder") || text.includes("storm")) return "Thunderstorm";
  if (text.includes("rain") || text.includes("shower") || text.includes("drizzle")) return "Rain";
  if (text.includes("fog") || text.includes("mist")) return "Fog";
  if (text.includes("snow") || text.includes("hail")) return "Snow";
  if (text.includes("overcast")) return "Overcast";
  if (text.includes("cloudy")) return "Partly Cloudy";
  if (text.includes("wind")) return "High Wind";
  return "Clear";
}

// BOM product codes to try in order
const BOM_PRODUCTS = ["IDW60901", "IDW60903", "IDW60920"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const station = nearestStation(lat, lng);
  const [stationId, stationName, sLat, sLng] = station;
  const distanceKm = Math.round(haversine(lat, lng, sLat, sLng));

  for (const product of BOM_PRODUCTS) {
    try {
      const bomUrl = `http://www.bom.gov.au/fwo/${product}/${product}.${stationId}.json`;
      const res = await fetch(bomUrl, {
        next: { revalidate: 600 },
        headers: { "User-Agent": "FireTrace Pro / Fire Investigation" },
      });
      if (!res.ok) continue;

      const json = await res.json();
      const obs = json?.observations?.data?.[0];
      if (!obs) continue;

      return NextResponse.json({
        station: stationName,
        stationId,
        distanceKm,
        observedAt: obs.local_date_time_full,
        temperature: obs.air_temp,
        humidity: obs.rel_hum,
        windSpeedKmh: obs.wind_spd_kmh,
        windSpeedMs: obs.wind_spd_kt ? Math.round(obs.wind_spd_kt * 0.514) : null,
        windDirection: obs.wind_dir,
        conditions: mapConditions(obs.cloud ?? "", obs.weather ?? ""),
        apparentTemp: obs.apparent_t,
        dewPoint: obs.dewpt,
        pressureMsl: obs.press_msl,
        gustKmh: obs.gust_kmh,
        source: `BOM ${product}`,
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    { error: `No current BOM observations available for nearest station (${stationName}, ${distanceKm}km away)` },
    { status: 503 }
  );
}
