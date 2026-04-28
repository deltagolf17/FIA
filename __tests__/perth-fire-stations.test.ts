import { describe, it, expect } from "vitest";
import { closestStation, PERTH_FIRE_STATIONS } from "../lib/data/perth-fire-stations";

describe("PERTH_FIRE_STATIONS", () => {
  it("has at least 20 stations", () => {
    expect(PERTH_FIRE_STATIONS.length).toBeGreaterThanOrEqual(20);
  });

  it("every station has valid lat/lon within WA", () => {
    for (const s of PERTH_FIRE_STATIONS) {
      expect(s.lat).toBeGreaterThan(-40);
      expect(s.lat).toBeLessThan(-20);
      expect(s.lon).toBeGreaterThan(110);
      expect(s.lon).toBeLessThan(130);
    }
  });

  it("every station has a name and callsign", () => {
    for (const s of PERTH_FIRE_STATIONS) {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.callsign.length).toBeGreaterThan(0);
    }
  });

  it("type is one of CFRS, VFRS, BFB, SES", () => {
    const valid = ["CFRS", "VFRS", "BFB", "SES"];
    for (const s of PERTH_FIRE_STATIONS) {
      expect(valid).toContain(s.type);
    }
  });
});

describe("closestStation", () => {
  it("returns Perth City for coordinates at the Perth CBD", () => {
    // Perth CBD ≈ -31.9522, 115.8589
    const { station, distanceKm } = closestStation(-31.9522, 115.8589);
    expect(station.name).toBe("Perth City");
    expect(distanceKm).toBeLessThan(1);
  });

  it("returns Fremantle station for Fremantle coordinates", () => {
    const { station } = closestStation(-32.0567, 115.7484);
    expect(station.name).toBe("Fremantle");
  });

  it("returns a station and positive distance for any WA coordinate", () => {
    const { station, distanceKm } = closestStation(-33.0, 116.5);
    expect(station).toBeDefined();
    expect(distanceKm).toBeGreaterThan(0);
  });

  it("returns same station regardless of duplicate calls (pure function)", () => {
    const a = closestStation(-31.87, 115.97);
    const b = closestStation(-31.87, 115.97);
    expect(a.station.name).toBe(b.station.name);
    expect(a.distanceKm).toBe(b.distanceKm);
  });
});
