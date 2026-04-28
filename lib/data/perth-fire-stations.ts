// Perth metro fire stations — hardcoded for "Closest Station" computation
export interface FireStation {
  name: string;
  callsign: string;
  lat: number;
  lon: number;
  type: "CFRS" | "VFRS" | "BFB" | "SES";
}

export const PERTH_FIRE_STATIONS: FireStation[] = [
  { name: "Perth City",          callsign: "Perth CFRS",         lat: -31.9522, lon: 115.8589, type: "CFRS" },
  { name: "Fremantle",           callsign: "Fremantle CFRS",     lat: -32.0567, lon: 115.7484, type: "CFRS" },
  { name: "Murdoch",             callsign: "Murdoch CFRS",       lat: -32.0681, lon: 115.8371, type: "CFRS" },
  { name: "Jandakot",            callsign: "Jandakot CFRS",      lat: -32.1000, lon: 115.8800, type: "CFRS" },
  { name: "Armadale",            callsign: "Armadale CFRS",      lat: -32.1533, lon: 116.0136, type: "CFRS" },
  { name: "Midland",             callsign: "Midland CFRS",       lat: -31.8892, lon: 116.0128, type: "CFRS" },
  { name: "Osborne Park",        callsign: "Osborne Park CFRS",  lat: -31.8960, lon: 115.8082, type: "CFRS" },
  { name: "Karrinyup",           callsign: "Karrinyup CFRS",     lat: -31.8667, lon: 115.7833, type: "CFRS" },
  { name: "Cockburn",            callsign: "Cockburn CFRS",      lat: -32.1267, lon: 115.8433, type: "CFRS" },
  { name: "Wanneroo",            callsign: "Wanneroo CFRS",      lat: -31.7500, lon: 115.8067, type: "CFRS" },
  { name: "Rockingham",          callsign: "Rockingham CFRS",    lat: -32.2800, lon: 115.7283, type: "CFRS" },
  { name: "Mandurah",            callsign: "Mandurah CFRS",      lat: -32.5300, lon: 115.7217, type: "CFRS" },
  { name: "Swan",                callsign: "Swan CFRS",          lat: -31.8967, lon: 115.9733, type: "CFRS" },
  { name: "Mirrabooka",          callsign: "Mirrabooka CFRS",    lat: -31.8560, lon: 115.8670, type: "CFRS" },
  { name: "Cannington",          callsign: "Cannington CFRS",    lat: -32.0133, lon: 115.9433, type: "CFRS" },
  { name: "Belmont",             callsign: "Belmont CFRS",       lat: -31.9433, lon: 115.9333, type: "CFRS" },
  { name: "Clarkson",            callsign: "Clarkson VFRS",      lat: -31.6900, lon: 115.7900, type: "VFRS" },
  { name: "Ellenbrook",          callsign: "Ellenbrook VFRS",    lat: -31.7767, lon: 115.9700, type: "VFRS" },
  { name: "Gingin",              callsign: "Gingin VFRS",        lat: -31.3500, lon: 115.9000, type: "VFRS" },
  { name: "Pinjarra",            callsign: "Pinjarra VFRS",      lat: -32.6333, lon: 115.8733, type: "VFRS" },
];

export function closestStation(lat: number, lon: number): { station: FireStation; distanceKm: number } {
  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  let best = PERTH_FIRE_STATIONS[0];
  let bestDist = haversine(lat, lon, best.lat, best.lon);

  for (const s of PERTH_FIRE_STATIONS.slice(1)) {
    const d = haversine(lat, lon, s.lat, s.lon);
    if (d < bestDist) {
      best = s;
      bestDist = d;
    }
  }

  return { station: best, distanceKm: Math.round(bestDist * 10) / 10 };
}
