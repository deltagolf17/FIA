import { NextResponse } from "next/server";

export interface EmergencyIncident {
  id: string;
  title: string;
  type: string;
  category: string;
  location: string;
  description: string;
  link: string;
  pubDate: string;
  lat: number | null;
  lng: number | null;
  isFire: boolean;
}

function extractText(xml: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}><\\!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>`, "s").exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = new RegExp(`<${tag}>(.*?)<\\/${tag}>`, "s").exec(xml);
  return plainMatch ? plainMatch[1].trim() : "";
}

function parseIncidents(xml: string): EmergencyIncident[] {
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

  return itemMatches.map((item, index) => {
    const title = extractText(item, "title");
    const description = extractText(item, "description")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .trim();
    const link = extractText(item, "link");
    const pubDate = extractText(item, "pubDate");

    // georss:point gives "lat lng"
    const georss = /<georss:point>([\d.\-]+)\s+([\d.\-]+)<\/georss:point>/.exec(item);
    const lat = georss ? parseFloat(georss[1]) : null;
    const lng = georss ? parseFloat(georss[2]) : null;

    // Title format: "FIRE - VEHICLE FIRE - SUBURB WA" or "INCIDENT TYPE - Location"
    const parts = title.split(" - ");
    const category = parts[0]?.trim() ?? "INCIDENT";
    const type = parts[1]?.trim() ?? category;
    const location = parts.slice(2).join(" - ").trim() || parts.slice(1).join(" - ").trim();

    const isFire =
      category.toLowerCase().includes("fire") ||
      type.toLowerCase().includes("fire") ||
      title.toLowerCase().includes("bush fire") ||
      title.toLowerCase().includes("structure fire");

    return {
      id: link || `incident-${index}`,
      title,
      type,
      category,
      location,
      description,
      link,
      pubDate,
      lat,
      lng,
      isFire,
    };
  });
}

export async function GET() {
  try {
    const [incidentsRes, warningsRes, tfbRes] = await Promise.allSettled([
      fetch("https://api.emergency.wa.gov.au/v1/rss/incidents", {
        next: { revalidate: 120 },
        headers: { "User-Agent": "FireTrace Pro / Fire Investigation" },
      }),
      fetch("https://api.emergency.wa.gov.au/v1/rss/warnings", {
        next: { revalidate: 120 },
        headers: { "User-Agent": "FireTrace Pro / Fire Investigation" },
      }),
      fetch("https://api.emergency.wa.gov.au/v1/rss/total-fire-bans", {
        next: { revalidate: 300 },
        headers: { "User-Agent": "FireTrace Pro / Fire Investigation" },
      }),
    ]);

    let incidents: EmergencyIncident[] = [];
    let warnings: EmergencyIncident[] = [];
    let totalFireBans: string[] = [];

    if (incidentsRes.status === "fulfilled" && incidentsRes.value.ok) {
      const xml = await incidentsRes.value.text();
      incidents = parseIncidents(xml);
    }

    if (warningsRes.status === "fulfilled" && warningsRes.value.ok) {
      const xml = await warningsRes.value.text();
      warnings = parseIncidents(xml);
    }

    if (tfbRes.status === "fulfilled" && tfbRes.value.ok) {
      const xml = await tfbRes.value.text();
      const tfbItems = xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) ?? [];
      totalFireBans = tfbItems
        .map((m) => m.replace(/<title><!\[CDATA\[/, "").replace(/\]\]><\/title>/, ""))
        .filter((t) => !t.toLowerCase().includes("total fire ban")); // skip channel title
    }

    return NextResponse.json({
      incidents,
      warnings,
      totalFireBans,
      fetchedAt: new Date().toISOString(),
      counts: {
        incidents: incidents.length,
        fires: incidents.filter((i) => i.isFire).length,
        warnings: warnings.length,
        totalFireBans: totalFireBans.length,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message, incidents: [], warnings: [], totalFireBans: [] },
      { status: 500 }
    );
  }
}
