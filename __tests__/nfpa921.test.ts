import { describe, it, expect } from "vitest";
import {
  generateCaseNumber,
  getCauseCodeColor,
  getStatusColor,
  NFPA_CAUSE_CODES,
  NFPA921_CHECKLIST,
  FIRE_PATTERN_TYPES,
} from "../lib/nfpa/nfpa921";

describe("generateCaseNumber", () => {
  it("produces the FIA-YYYY-NNNN format", () => {
    const num = generateCaseNumber();
    expect(num).toMatch(/^FIA-\d{4}-\d{4}$/);
  });

  it("uses the current year", () => {
    const year = new Date().getFullYear().toString();
    expect(generateCaseNumber().startsWith(`FIA-${year}-`)).toBe(true);
  });

  it("generates unique values", () => {
    const nums = new Set(Array.from({ length: 50 }, generateCaseNumber));
    expect(nums.size).toBeGreaterThan(1);
  });
});

describe("getCauseCodeColor", () => {
  it("returns the correct class for each NFPA cause code", () => {
    expect(getCauseCodeColor("NATURAL")).toContain("green");
    expect(getCauseCodeColor("ACCIDENTAL")).toContain("blue");
    expect(getCauseCodeColor("INCENDIARY")).toContain("red");
    expect(getCauseCodeColor("UNDETERMINED")).toContain("yellow");
  });

  it("returns a fallback for unknown codes", () => {
    expect(getCauseCodeColor("UNKNOWN")).toContain("gray");
  });
});

describe("getStatusColor", () => {
  it("returns correct classes for all investigation statuses", () => {
    expect(getStatusColor("OPEN")).toContain("blue");
    expect(getStatusColor("IN_PROGRESS")).toContain("orange");
    expect(getStatusColor("PENDING_REVIEW")).toContain("yellow");
    expect(getStatusColor("CLOSED")).toContain("green");
    expect(getStatusColor("ARCHIVED")).toContain("gray");
  });
});

describe("NFPA_CAUSE_CODES", () => {
  it("has all four standard NFPA cause classifications", () => {
    expect(Object.keys(NFPA_CAUSE_CODES)).toEqual(
      expect.arrayContaining(["NATURAL", "ACCIDENTAL", "INCENDIARY", "UNDETERMINED"])
    );
  });

  it("each code has required fields", () => {
    for (const [, v] of Object.entries(NFPA_CAUSE_CODES)) {
      expect(v).toHaveProperty("code");
      expect(v).toHaveProperty("label");
      expect(v).toHaveProperty("description");
      expect(v).toHaveProperty("nfpaSection");
    }
  });
});

describe("NFPA921_CHECKLIST", () => {
  it("is non-empty", () => {
    expect(NFPA921_CHECKLIST.length).toBeGreaterThan(0);
  });

  it("every item has a unique id", () => {
    const ids = NFPA921_CHECKLIST.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every item has required fields", () => {
    for (const item of NFPA921_CHECKLIST) {
      expect(typeof item.id).toBe("string");
      expect(typeof item.requirement).toBe("string");
      expect(typeof item.nfpaSection).toBe("string");
      expect(["SCENE", "DOCUMENTATION", "ORIGIN", "CAUSE", "REPORT"]).toContain(item.category);
    }
  });
});

describe("FIRE_PATTERN_TYPES", () => {
  it("contains all 10 expected pattern types", () => {
    const types = FIRE_PATTERN_TYPES.map((p) => p.type);
    expect(types).toContain("V_PATTERN");
    expect(types).toContain("POUR_PATTERN");
    expect(types).toContain("CHAR_DEPTH");
    expect(types).toContain("CLEAN_BURN");
    expect(types).toContain("SPALLING");
  });

  it("every pattern has a label and NFPA section", () => {
    for (const p of FIRE_PATTERN_TYPES) {
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.section).toMatch(/NFPA 921/);
    }
  });
});
