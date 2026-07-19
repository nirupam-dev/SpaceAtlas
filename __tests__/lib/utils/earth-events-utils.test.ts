/**
 * ─── Earth Events Utilities Tests ───────────────────────────────
 */

import {
  getCategoryIcon, getCategoryColor, getCategoryDescription,
  countEventCategories, filterEventsByCategory,
  CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR,
  type EonetEvent,
} from "@/lib/utils/earth-events-utils";

// ─── Helper ───────────────────────────────────────────────────

function mockEvent(id: string, categoryId: string): EonetEvent {
  return {
    id,
    title: `Event ${id}`,
    categories: [{ id: categoryId, title: categoryId }],
    geometry: [{ date: "2024-01-01", type: "Point", coordinates: [0, 0] }],
    sources: [{ id: "test", url: "https://test.com" }],
  };
}

// ─── getCategoryIcon ──────────────────────────────────────────

describe("getCategoryIcon", () => {
  it("returns a component for known categories", () => {
    const Icon = getCategoryIcon("wildfires");
    expect(Icon).toBeTruthy();
    expect(typeof Icon === "function" || typeof Icon === "object").toBe(true);
  });

  it("returns default icon for unknown categories", () => {
    const Icon = getCategoryIcon("unknown_category");
    expect(Icon).toBeTruthy();
    expect(typeof Icon === "function" || typeof Icon === "object").toBe(true);
  });
});

// ─── getCategoryColor ─────────────────────────────────────────

describe("getCategoryColor", () => {
  it("returns correct color for wildfires", () => {
    expect(getCategoryColor("wildfires")).toContain("orange");
  });

  it("returns correct color for volcanoes", () => {
    expect(getCategoryColor("volcanoes")).toContain("red");
  });

  it("returns default for unknown category", () => {
    expect(getCategoryColor("aliens")).toBe(DEFAULT_CATEGORY_COLOR);
  });
});

// ─── getCategoryDescription ───────────────────────────────────

describe("getCategoryDescription", () => {
  it("returns description for known categories", () => {
    const desc = getCategoryDescription("wildfires");
    expect(desc).toContain("wildfire");
  });

  it("returns default description for unknown", () => {
    const desc = getCategoryDescription("unknown");
    expect(desc).toContain("satellite observation");
  });
});

// ─── countEventCategories ─────────────────────────────────────

describe("countEventCategories", () => {
  it("counts events by category", () => {
    const events = [
      mockEvent("1", "wildfires"),
      mockEvent("2", "wildfires"),
      mockEvent("3", "volcanoes"),
    ];
    const counts = countEventCategories(events);
    expect(counts["wildfires"]).toBe(2);
    expect(counts["volcanoes"]).toBe(1);
  });

  it("uses 'other' for events without categories", () => {
    const event: EonetEvent = {
      id: "1", title: "Test",
      categories: [],
      geometry: [], sources: [],
    };
    const counts = countEventCategories([event]);
    expect(counts["other"]).toBe(1);
  });
});

// ─── filterEventsByCategory ───────────────────────────────────

describe("filterEventsByCategory", () => {
  const events = [
    mockEvent("1", "wildfires"),
    mockEvent("2", "volcanoes"),
    mockEvent("3", "wildfires"),
  ];

  it("returns all events for 'all' filter", () => {
    expect(filterEventsByCategory(events, "all")).toHaveLength(3);
  });

  it("filters by specific category", () => {
    const result = filterEventsByCategory(events, "wildfires");
    expect(result).toHaveLength(2);
    expect(result.every(e => e.categories[0].id === "wildfires")).toBe(true);
  });

  it("returns empty for non-existent category", () => {
    expect(filterEventsByCategory(events, "earthquakes")).toHaveLength(0);
  });
});
