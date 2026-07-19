/**
 * ─── Fireball Utilities Tests ───────────────────────────────────
 */

import {
  getImpactScale, getAltitudeDescription, parseFireballData,
  computeFireballStats, isLargeFireball, getMaxImpactEnergy,
  type Fireball,
} from "@/lib/utils/fireball-utils";

// ─── Helper ───────────────────────────────────────────────────

function mockFireball(overrides?: Partial<Fireball>): Fireball {
  return {
    date: "2024-01-15 12:00:00",
    lat: "45.0", "lat-dir": "N",
    lon: "90.0", "lon-dir": "E",
    energy: "1e10",
    "impact-e": "0.5",
    vel: "20.0",
    alt: "50.0",
    ...overrides,
  };
}

// ─── getImpactScale ───────────────────────────────────────────

describe("getImpactScale", () => {
  it.each([
    [200, "Catastrophic"],
    [50, "Significant"],
    [5, "Notable"],
    [0.5, "Minor"],
    [0.01, "Small"],
  ])("classifies %d kT as %s", (kt, expected) => {
    expect(getImpactScale(kt).label).toBe(expected);
  });

  it("returns color strings for all tiers", () => {
    const result = getImpactScale(100);
    expect(result.color).toContain("text-");
    expect(result.desc).toBeTruthy();
  });
});

// ─── getAltitudeDescription ───────────────────────────────────

describe("getAltitudeDescription", () => {
  it.each([
    [70, "Mesosphere"],
    [45, "Stratosphere"],
    [25, "Lower stratosphere"],
    [10, "Troposphere"],
  ])("describes %d km altitude correctly", (alt, keyword) => {
    expect(getAltitudeDescription(alt)).toContain(keyword);
  });
});

// ─── parseFireballData ────────────────────────────────────────

describe("parseFireballData", () => {
  it("maps field-row pairs into Fireball objects", () => {
    const fields = ["date", "lat", "lon"];
    const data = [
      ["2024-01-01", "30.0", "60.0"],
      ["2024-01-02", "40.0", "70.0"],
    ];
    const result = parseFireballData(fields, data);
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe("2024-01-01");
    expect(result[1].lat).toBe("40.0");
  });
});

// ─── computeFireballStats ─────────────────────────────────────

describe("computeFireballStats", () => {
  it("computes total energy, max impact, and avg velocity", () => {
    const fireballs = [
      mockFireball({ "impact-e": "2.0", vel: "20.0" }),
      mockFireball({ "impact-e": "3.0", vel: "30.0" }),
    ];
    const stats = computeFireballStats(fireballs);
    expect(stats.totalEnergy).toBe(5.0);
    expect(stats.maxImpact).toBe(3.0);
    expect(stats.avgVelocity).toBe("25.0");
  });

  it("returns dash for avg velocity when no velocity data", () => {
    const fireballs = [mockFireball({ vel: null })];
    const stats = computeFireballStats(fireballs);
    expect(stats.avgVelocity).toBe("—");
  });
});

// ─── isLargeFireball ──────────────────────────────────────────

describe("isLargeFireball", () => {
  it("returns true for impact > 1 kT", () => {
    expect(isLargeFireball(5, null)).toBe(true);
  });

  it("returns true for energy > 1e11 J", () => {
    expect(isLargeFireball(null, 2e11)).toBe(true);
  });

  it("returns false for small events", () => {
    expect(isLargeFireball(0.1, 1e9)).toBe(false);
  });
});

// ─── getMaxImpactEnergy ───────────────────────────────────────

describe("getMaxImpactEnergy", () => {
  it("returns the max impact energy", () => {
    const fireballs = [
      mockFireball({ "impact-e": "1.0" }),
      mockFireball({ "impact-e": "5.0" }),
      mockFireball({ "impact-e": "2.0" }),
    ];
    expect(getMaxImpactEnergy(fireballs)).toBe(5.0);
  });

  it("returns 0.01 minimum for empty list", () => {
    expect(getMaxImpactEnergy([])).toBe(0.01);
  });
});
