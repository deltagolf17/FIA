import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });

  const url = new URL(
    "https://services.slip.wa.gov.au/public/rest/services/Geocoder/ESRIWAGeocoder/GeocodeServer/findAddressCandidates"
  );
  url.searchParams.set("SingleLine", address);
  url.searchParams.set("f", "json");
  url.searchParams.set("outFields", "Loc_name,Score,Match_addr");
  url.searchParams.set("outSR", "4326");
  url.searchParams.set("maxLocations", "1");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "FireTrace Pro / Fire Investigation" },
    });
    if (!res.ok) throw new Error(`Geocode failed: ${res.status}`);

    const json = await res.json();
    const candidates: Array<{ location: { x: number; y: number }; score: number; address: string }> =
      json.candidates ?? [];

    if (candidates.length === 0) {
      return NextResponse.json({ error: "No results found for that address" }, { status: 404 });
    }

    const best = candidates[0];
    return NextResponse.json({
      lat: best.location.y,
      lng: best.location.x,
      score: best.score,
      matchAddress: best.address,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
