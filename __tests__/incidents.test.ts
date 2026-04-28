import { describe, it, expect } from "vitest";

// Pure helper extracted for testing — mirrors the logic in app/api/live-incidents/route.ts
function mapType(raw: string): string {
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

// Pure helper — mirrors degToCardinal in weather/nearby/route.ts
function degToCardinal(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

describe("mapType", () => {
  it("correctly maps structure fire variants", () => {
    expect(mapType("Structure fire")).toBe("STRUCTURE_FIRE");
    expect(mapType("Building fire")).toBe("STRUCTURE_FIRE");
    expect(mapType("House fire")).toBe("STRUCTURE_FIRE");
  });

  it("correctly maps vehicle fire variants", () => {
    expect(mapType("Vehicle fire")).toBe("VEHICLE_FIRE");
    expect(mapType("Car fire")).toBe("VEHICLE_FIRE");
    expect(mapType("Truck fire")).toBe("VEHICLE_FIRE");
  });

  it("correctly maps vegetation fire variants", () => {
    expect(mapType("Vegetation fire")).toBe("VEGETATION_FIRE");
    expect(mapType("Bush fire")).toBe("VEGETATION_FIRE");
    expect(mapType("Grass fire")).toBe("VEGETATION_FIRE");
    expect(mapType("Wildfire")).toBe("VEGETATION_FIRE");
  });

  it("correctly maps hazmat", () => {
    expect(mapType("HazMat incident")).toBe("HAZMAT");
    expect(mapType("Chemical spill")).toBe("HAZMAT");
    expect(mapType("Gas leak")).toBe("HAZMAT");
  });

  it("correctly maps rescue", () => {
    expect(mapType("Person rescue")).toBe("RESCUE");
    expect(mapType("Entrapment")).toBe("RESCUE");
  });

  it("correctly maps alarm", () => {
    expect(mapType("Alarm activation")).toBe("ALARM");
    expect(mapType("False alarm")).toBe("ALARM");
  });

  it("falls back to OTHER for generic fire and unknown types", () => {
    expect(mapType("Fire")).toBe("OTHER");
    expect(mapType("Unknown incident")).toBe("OTHER");
  });

  it("is case-insensitive", () => {
    expect(mapType("STRUCTURE FIRE")).toBe("STRUCTURE_FIRE");
    expect(mapType("BUSH FIRE")).toBe("VEGETATION_FIRE");
  });
});

describe("degToCardinal", () => {
  it("converts 0° to N", () => expect(degToCardinal(0)).toBe("N"));
  it("converts 90° to E", () => expect(degToCardinal(90)).toBe("E"));
  it("converts 180° to S", () => expect(degToCardinal(180)).toBe("S"));
  it("converts 270° to W", () => expect(degToCardinal(270)).toBe("W"));
  it("converts 45° to NE", () => expect(degToCardinal(45)).toBe("NE"));
  it("converts 135° to SE", () => expect(degToCardinal(135)).toBe("SE"));
  it("converts 225° to SW", () => expect(degToCardinal(225)).toBe("SW"));
  it("converts 315° to NW", () => expect(degToCardinal(315)).toBe("NW"));
  it("converts 360° back to N", () => expect(degToCardinal(360)).toBe("N"));
});
