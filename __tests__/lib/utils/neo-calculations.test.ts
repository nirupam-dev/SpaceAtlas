/**
 * ─── NEO Calculations Tests ─────────────────────────────────────
 */

import {
  getThreatInfo, getSizeComparison, calculateProximityBarFill,
  extractAndSortNeos, computeNeoStats, formatWithCommas,
  type NeoObject,
} from "@/lib/utils/neo-calculations";

// ─── Helper: mock NeoObject ───────────────────────────────────

function mockNeo(overrides: Partial<NeoObject> & { missKm?: string; missLD?: string }): NeoObject {
  return {
    id: "1",
    name: "Test Asteroid",
    estimated_diameter: { meters: { estimated_diameter_min: 50, estimated_diameter_max: 100 } },
    is_potentially_hazardous_asteroid: false,
    close_approach_data: [{
      close_approach_date_full: "2024-Jan-01 12:00",
      close_approach_date: "2024-01-01",
      relative_velocity: { kilometers_per_hour: "50000", kilometers_per_second: "13.9" },
      miss_distance: {
        astronomical: "0.01",
        kilometers: overrides.missKm ?? "1000000",
        lunar: overrides.missLD ?? "20",
        miles: "600000",
      },
      orbiting_body: "Earth",
    }],
    absolute_magnitude_h: 22.5,
    ...overrides,
  };
}

// ─── getThreatInfo ────────────────────────────────────────────

describe("getThreatInfo", () => {
  it("returns HIGH for hazardous + close approach (<5 LD)", () => {
    const result = getThreatInfo(true, 3);
    expect(result.level).toBe("HIGH");
    expect(result.color).toContain("red");
  });

  it("returns MODERATE for hazardous but far", () => {
    const result = getThreatInfo(true, 20);
    expect(result.level).toBe("MODERATE");
    expect(result.color).toContain("amber");
  });

  it("returns WATCH for non-hazardous within 10 LD", () => {
    const result = getThreatInfo(false, 8);
    expect(result.level).toBe("WATCH");
    expect(result.color).toContain("yellow");
  });

  it("returns SAFE for non-hazardous beyond 10 LD", () => {
    const result = getThreatInfo(false, 50);
    expect(result.level).toBe("SAFE");
    expect(result.color).toContain("emerald");
  });
});

// ─── getSizeComparison ────────────────────────────────────────

describe("getSizeComparison", () => {
  it.each([
    [0.5, "Smaller than a car"],
    [5, "Size of a bus"],
    [15, "Size of a house"],
    [35, "Statue of Liberty scale"],
    [80, "Football field scale"],
    [200, "Skyscraper scale"],
    [500, "Mountain scale"],
  ])("returns correct comparison for %d meters", (m, expected) => {
    expect(getSizeComparison(m)).toBe(expected);
  });
});

// ─── calculateProximityBarFill ────────────────────────────────

describe("calculateProximityBarFill", () => {
  it("returns near 100% for very close objects", () => {
    const fill = calculateProximityBarFill(0.5);
    expect(fill).toBeGreaterThan(95);
  });

  it("returns minimum fill for very distant objects", () => {
    const fill = calculateProximityBarFill(100);
    expect(fill).toBe(5); // BAR_FILL_MIN
  });

  it("returns intermediate values for mid-range distances", () => {
    const fill = calculateProximityBarFill(25);
    expect(fill).toBeGreaterThan(40);
    expect(fill).toBeLessThan(60);
  });
});

// ─── extractAndSortNeos ───────────────────────────────────────

describe("extractAndSortNeos", () => {
  it("returns empty array for undefined input", () => {
    expect(extractAndSortNeos(undefined)).toEqual([]);
  });

  it("flattens and sorts by miss distance ascending", () => {
    const data = {
      "2024-01-01": [mockNeo({ id: "far", missKm: "5000000" })],
      "2024-01-02": [mockNeo({ id: "close", missKm: "1000000" })],
    };
    const result = extractAndSortNeos(data);
    expect(result[0].id).toBe("close");
    expect(result[1].id).toBe("far");
  });
});

// ─── computeNeoStats ──────────────────────────────────────────

describe("computeNeoStats", () => {
  it("counts hazardous asteroids correctly", () => {
    const asteroids = [
      mockNeo({ id: "1", is_potentially_hazardous_asteroid: true }),
      mockNeo({ id: "2", is_potentially_hazardous_asteroid: false }),
      mockNeo({ id: "3", is_potentially_hazardous_asteroid: true }),
    ];
    const stats = computeNeoStats(asteroids);
    expect(stats.hazardousCount).toBe(2);
  });

  it("returns dash for empty array", () => {
    expect(computeNeoStats([]).closestLD).toBe("—");
  });
});

// ─── formatWithCommas ─────────────────────────────────────────

describe("formatWithCommas", () => {
  it("formats thousands with commas", () => {
    expect(formatWithCommas(142536)).toBe("142,536");
  });

  it("leaves small numbers unchanged", () => {
    expect(formatWithCommas(999)).toBe("999");
  });
});
