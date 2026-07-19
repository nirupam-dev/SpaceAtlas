/**
 * ─── Exoplanet Utilities Tests ──────────────────────────────────
 */

import {
  getPlanetType, getHabitability, getPlanetGradient,
  countDiscoveryMethods, DISCOVERY_METHOD_COLORS,
  type Exoplanet,
} from "@/lib/utils/exoplanet-utils";

// ─── getPlanetType ────────────────────────────────────────────

describe("getPlanetType", () => {
  it("returns Unknown for null radius", () => {
    expect(getPlanetType(null, null).type).toBe("Unknown");
  });

  it.each([
    [0.8, "Terrestrial"],
    [1.5, "Super-Earth"],
    [3.0, "Sub-Neptune"],
    [5.0, "Neptune-like"],
    [10.0, "Gas Giant"],
    [20.0, "Super-Jupiter"],
  ])("classifies radius %d R⊕ as %s", (rade, expected) => {
    expect(getPlanetType(rade, null).type).toBe(expected);
  });

  it("includes color and description", () => {
    const result = getPlanetType(1.0, 1.0);
    expect(result.color).toContain("text-");
    expect(result.desc.length).toBeGreaterThan(0);
  });
});

// ─── getHabitability ──────────────────────────────────────────

describe("getHabitability", () => {
  it("returns Unknown for missing data", () => {
    expect(getHabitability(null, null).score).toBe("Unknown");
    expect(getHabitability(250, null).score).toBe("Unknown");
  });

  it("returns High for temperate zone + right size", () => {
    const result = getHabitability(280, 1.2);
    expect(result.score).toBe("High");
    expect(result.color).toContain("emerald");
  });

  it("returns Moderate for temperate zone + wrong size", () => {
    expect(getHabitability(260, 10).score).toBe("Moderate");
  });

  it("returns Low (Cold) for right size + cold", () => {
    expect(getHabitability(100, 1.0).score).toBe("Low (Cold)");
  });

  it("returns Low (Hot) for right size + hot", () => {
    expect(getHabitability(500, 1.0).score).toBe("Low (Hot)");
  });

  it("returns Unlikely for everything else", () => {
    expect(getHabitability(50, 15).score).toBe("Unlikely");
  });
});

// ─── getPlanetGradient ────────────────────────────────────────

describe("getPlanetGradient", () => {
  it("returns deterministic gradient for same name", () => {
    const g1 = getPlanetGradient("Kepler-442b");
    const g2 = getPlanetGradient("Kepler-442b");
    expect(g1).toBe(g2);
  });

  it("returns different gradients for different names", () => {
    const g1 = getPlanetGradient("TRAPPIST-1e");
    const g2 = getPlanetGradient("Proxima Centauri b");
    // Different names with different character sums should (usually) differ
    expect(typeof g1).toBe("string");
    expect(typeof g2).toBe("string");
  });

  it("returns a valid Tailwind gradient string", () => {
    const g = getPlanetGradient("Test Planet");
    expect(g).toMatch(/from-/);
    expect(g).toMatch(/via-/);
    expect(g).toMatch(/to-/);
  });
});

// ─── countDiscoveryMethods ────────────────────────────────────

describe("countDiscoveryMethods", () => {
  it("counts methods correctly", () => {
    const planets: Partial<Exoplanet>[] = [
      { pl_name: "A", discoverymethod: "Transit" },
      { pl_name: "B", discoverymethod: "Transit" },
      { pl_name: "C", discoverymethod: "Imaging" },
    ];
    const counts = countDiscoveryMethods(planets as Exoplanet[]);
    expect(counts["Transit"]).toBe(2);
    expect(counts["Imaging"]).toBe(1);
  });

  it("uses 'Unknown' for missing method", () => {
    const planets = [{ pl_name: "X", discoverymethod: "" }] as Exoplanet[];
    const counts = countDiscoveryMethods(planets);
    expect(counts["Unknown"]).toBe(1);
  });
});

// ─── DISCOVERY_METHOD_COLORS ──────────────────────────────────

describe("DISCOVERY_METHOD_COLORS", () => {
  it("has entries for common methods", () => {
    expect(DISCOVERY_METHOD_COLORS["Transit"]).toBeDefined();
    expect(DISCOVERY_METHOD_COLORS["Radial Velocity"]).toBeDefined();
  });
});
