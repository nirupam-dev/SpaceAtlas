/**
 * ─── Space Weather Utilities Tests ──────────────────────────────
 */

import {
  getKpDescription, isStrongFlare, getFlareImpactDescription,
  getMostAccurateAnalysis, getMaxKp, formatShortDate, formatFullDate,
  type CMEAnalysis, type KpReading,
} from "@/lib/utils/space-weather-utils";

// ─── getKpDescription ─────────────────────────────────────────

describe("getKpDescription", () => {
  it.each([
    [9, "Extreme (G5)", "text-red-400"],
    [8, "Severe (G4)", "text-red-400"],
    [7, "Strong (G3)", "text-orange-400"],
    [6, "Moderate (G2)", "text-amber-400"],
    [5, "Minor (G1)", "text-yellow-400"],
    [4, "Below Storm", "text-cyan-400"],
    [0, "Below Storm", "text-cyan-400"],
  ])("classifies Kp %d as %s with %s", (kp, expectedLevel, expectedColor) => {
    const result = getKpDescription(kp);
    expect(result.level).toBe(expectedLevel);
    expect(result.color).toBe(expectedColor);
  });

  it("handles boundary at Kp 5 (Minor G1 threshold)", () => {
    expect(getKpDescription(5).level).toBe("Minor (G1)");
    expect(getKpDescription(4.9).level).toBe("Below Storm");
  });

  it("handles boundary at Kp 9 (Extreme G5 threshold)", () => {
    expect(getKpDescription(9).level).toBe("Extreme (G5)");
    expect(getKpDescription(8.9).level).toBe("Severe (G4)");
  });
});

// ─── isStrongFlare ────────────────────────────────────────────

describe("isStrongFlare", () => {
  it("returns true for X-class flares", () => {
    expect(isStrongFlare("X2.5")).toBe(true);
    expect(isStrongFlare("X1.0")).toBe(true);
  });

  it("returns true for M-class flares", () => {
    expect(isStrongFlare("M5.3")).toBe(true);
    expect(isStrongFlare("M1.0")).toBe(true);
  });

  it("returns false for C-class and weaker flares", () => {
    expect(isStrongFlare("C3.0")).toBe(false);
    expect(isStrongFlare("B2.1")).toBe(false);
    expect(isStrongFlare("A1.0")).toBe(false);
  });

  it("returns false for undefined or empty input", () => {
    expect(isStrongFlare(undefined)).toBe(false);
    expect(isStrongFlare("")).toBe(false);
  });
});

// ─── getFlareImpactDescription ────────────────────────────────

describe("getFlareImpactDescription", () => {
  it("returns most intense description for X-class", () => {
    const desc = getFlareImpactDescription("X5.0");
    expect(desc).toContain("Most intense");
    expect(desc).toContain("radio blackouts");
  });

  it("returns moderate description for M-class", () => {
    const desc = getFlareImpactDescription("M3.0");
    expect(desc).toContain("Moderate");
    expect(desc).toContain("brief radio blackouts");
  });

  it("returns small description for C-class", () => {
    const desc = getFlareImpactDescription("C1.5");
    expect(desc).toContain("Small");
  });

  it("returns minimal for unknown or B-class", () => {
    expect(getFlareImpactDescription("B1.0")).toBe("Minimal impact");
    expect(getFlareImpactDescription(undefined)).toBe("Minimal impact");
  });
});

// ─── getMostAccurateAnalysis ──────────────────────────────────

describe("getMostAccurateAnalysis", () => {
  const analysisA: CMEAnalysis = { type: "S", speed: 500, halfAngle: 30, isMostAccurate: false };
  const analysisB: CMEAnalysis = { type: "S", speed: 800, halfAngle: 45, isMostAccurate: true };
  const analysisC: CMEAnalysis = { type: "C", speed: 600, halfAngle: 25, isMostAccurate: false };

  it("returns the analysis flagged as most accurate", () => {
    const result = getMostAccurateAnalysis([analysisA, analysisB, analysisC]);
    expect(result).toBe(analysisB);
    expect(result?.speed).toBe(800);
  });

  it("falls back to the first entry if none is flagged", () => {
    const result = getMostAccurateAnalysis([analysisA, analysisC]);
    expect(result).toBe(analysisA);
  });

  it("returns undefined for empty array", () => {
    expect(getMostAccurateAnalysis([])).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(getMostAccurateAnalysis(undefined)).toBeUndefined();
  });
});

// ─── getMaxKp ─────────────────────────────────────────────────

describe("getMaxKp", () => {
  it("returns the maximum Kp index from readings", () => {
    const readings: KpReading[] = [
      { kpIndex: 3, observedTime: "2024-01-01 00:00", source: "NOAA" },
      { kpIndex: 7, observedTime: "2024-01-01 03:00", source: "NOAA" },
      { kpIndex: 5, observedTime: "2024-01-01 06:00", source: "NOAA" },
    ];
    expect(getMaxKp(readings)).toBe(7);
  });

  it("returns 0 for empty array", () => {
    expect(getMaxKp([])).toBe(0);
  });

  it("returns 0 for undefined input", () => {
    expect(getMaxKp(undefined)).toBe(0);
  });

  it("handles single reading", () => {
    const readings: KpReading[] = [
      { kpIndex: 9, observedTime: "2024-01-01 00:00", source: "USGS" },
    ];
    expect(getMaxKp(readings)).toBe(9);
  });
});

// ─── formatShortDate ──────────────────────────────────────────

describe("formatShortDate", () => {
  it("formats a valid date string into compact format", () => {
    const result = formatShortDate("2024-01-15T14:30:00Z");
    // Should contain month and day at minimum
    expect(result).toContain("Jan");
    expect(result).toContain("15");
  });

  it("returns original string for invalid dates", () => {
    expect(formatShortDate("not-a-date")).toBe("not-a-date");
  });

  it("handles ISO date strings", () => {
    const result = formatShortDate("2024-06-22T08:15:00Z");
    expect(result).toContain("Jun");
    expect(result).toContain("22");
  });
});

// ─── formatFullDate ───────────────────────────────────────────

describe("formatFullDate", () => {
  it("formats a valid date string into full display format", () => {
    const result = formatFullDate("2024-01-15T14:30:00Z");
    // Should contain weekday, month, day, year
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("returns original string for invalid dates", () => {
    expect(formatFullDate("garbage-date")).toBe("garbage-date");
  });

  it("includes time components", () => {
    const result = formatFullDate("2024-06-22T08:15:00Z");
    // Should contain some time representation
    expect(result).toContain("Jun");
    expect(result).toContain("22");
    expect(result).toContain("2024");
  });
});
