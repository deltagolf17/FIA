import { NextResponse } from "next/server";
import type { LiveIncident, IncidentType } from "@/types/incidents";

function mapType(raw: string): IncidentType {
  const t = raw.toLowerCase();
  if (t.includes("structure") || t.includes("building") || t.includes("house")) return "STRUCTURE_FIRE";
  if (t.includes("vehicle") || t.includes("car") || t.includes("truck")) return "VEHICLE_FIRE";
  if (t.includes("vegetation") || t.includes("bush") || t.includes("grass") || t.includes("scrub") || t.includes("wildfire")) return "VEGETATION_FIRE";
  if (t.includes("hazmat") || t.includes("chemical") || t.includes("gas")) return "HAZMAT";
  if (t.includes("rescue") || t.includes("entrapment") || t.includes("person")) return "RESCUE";
  if (t.includes("alarm") || t.includes("false")) return "ALARM";
  if (t.includes("fire")) return "OTHER";
  return "OTHER";
}

function extractTag(xml: string, tag: string): string {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(xml);
  return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
}

function parseXMLFeed(xml: string): LiveIncident[] {
  // Try message_1.xml format first (individual message elements)
  const messageMatches = xml.match(/<message[^>]*>([\s\S]*?)<\/message>/g) ?? [];

  if (messageMatches.length > 0) {
    return messageMatches.map((msg, i): LiveIncident => {
      const rawType = extractTag(msg, "type") || extractTag(msg, "incidenttype") || "Fire";
      const lat = parseFloat(extractTag(msg, "latitude") || extractTag(msg, "lat") || "");
      const lon = parseFloat(extractTag(msg, "longitude") || extractTag(msg, "lon") || "");
      const startDate = extractTag(msg, "startdate") || extractTag(msg, "starttime") || new Date().toISOString();
      const status = (extractTag(msg, "status") || "open").toLowerCase();

      return {
        id: extractTag(msg, "id") || extractTag(msg, "messageid") || String(i),
        type: mapType(rawType),
        rawType,
        status: status.includes("active") ? "active" : status.includes("closed") ? "closed" : "open",
        startDate: startDate.includes("T") ? startDate : `${startDate}T00:00:00`,
        lastUpdated: extractTag(msg, "lastupdated") || new Date().toISOString(),
        address: extractTag(msg, "address") || extractTag(msg, "street") || "",
        suburb: extractTag(msg, "suburb") || extractTag(msg, "location") || "",
        lga: extractTag(msg, "lga") || extractTag(msg, "localgovernment") || "",
        lat: isNaN(lat) ? null : lat,
        lon: isNaN(lon) ? null : lon,
        fdrDistrict: extractTag(msg, "fdrdistrict") || extractTag(msg, "district") || "",
        fdrRating: extractTag(msg, "fdrrating") || extractTag(msg, "firedangerrating") || "No Rating",
        fdrIndex: parseFloat(extractTag(msg, "fdrindex") || "") || null,
        description: extractTag(msg, "description") || undefined,
      };
    });
  }

  // Fall back to RSS item format
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  return itemMatches.map((item, i): LiveIncident => {
    const title = extractTag(item, "title");
    const parts = title.split(" - ");
    const rawType = parts[1]?.trim() || "Fire";
    const suburb = parts[2]?.trim() || parts[1]?.trim() || "";
    const georss = /<georss:point>([\d.\-]+)\s+([\d.\-]+)<\/georss:point>/.exec(item);
    const lat = georss ? parseFloat(georss[1]) : null;
    const lon = georss ? parseFloat(georss[2]) : null;
    const pubDate = extractTag(item, "pubDate");

    return {
      id: extractTag(item, "link") || String(i),
      type: mapType(rawType),
      rawType,
      status: "active",
      startDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      lastUpdated: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      address: suburb,
      suburb,
      lga: "",
      lat,
      lon,
      fdrDistrict: "",
      fdrRating: "No Rating",
      fdrIndex: null,
      description: extractTag(item, "description").replace(/<[^>]+>/g, "").trim() || undefined,
    };
  });
}

export async function GET() {
  const sources = [
    "https://www.emergency.wa.gov.au/data/message_1.xml",
    "https://api.emergency.wa.gov.au/v1/rss/incidents",
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 30 },
        headers: { "User-Agent": "FireTrace Pro / Fire Investigation" },
      });
      if (!res.ok) continue;
      const text = await res.text();
      const incidents = parseXMLFeed(text);
      return NextResponse.json({
        incidents,
        source: url,
        fetchedAt: new Date().toISOString(),
        count: incidents.length,
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ incidents: [], error: "All Emergency WA sources unavailable", fetchedAt: new Date().toISOString(), count: 0 });
}
