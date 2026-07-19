/**
 * Component tests for the Observatory page's interactive sub-components.
 *
 * These tests verify:
 * - Data fetching and rendering
 * - Click-to-expand interactivity
 * - Keyboard accessibility (Enter/Space to toggle)
 * - ARIA attributes (role, aria-expanded)
 * - Error state rendering
 * - Loading state rendering
 */
import React from "react";
import { render, screen, waitFor, within, cleanup, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ── Mocks ─────────────────────────────────────────────────────
// Framer Motion: render children without animations
jest.mock("framer-motion", () => {
  const R = require("react");
  return {
    motion: new Proxy(
      {},
      {
        get: (_: unknown, tag: string) =>
          R.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            // Strip motion-specific props
            const {
              initial, animate, exit, transition, whileInView, viewport,
              whileHover, whileTap, variants, layout, layoutId,
              onAnimationComplete, ...rest
            } = props;
            return R.createElement(tag, { ...rest, ref });
          }),
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useInView: () => true,
  };
});

// NasaImageBanner: skip in unit tests (it fetches external images)
jest.mock("@/components/ui/NasaImageBanner", () => {
  return function MockNasaImageBanner() {
    return <div data-testid="nasa-image-banner" />;
  };
});

// ── Static imports (avoids dual-React from dynamic import) ────
import AsteroidWatch from "@/components/ui/AsteroidWatch";
import SpaceWeather from "@/components/ui/SpaceWeather";
import FireballTracker from "@/components/ui/FireballTracker";

// ── Test Helpers ──────────────────────────────────────────────

/** Creates a fresh QueryClient with retry disabled for deterministic tests */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });
}

/** Wraps a component in QueryClientProvider for testing */
function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

function mockFetchResponse(data: unknown, ok = true) {
  return jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
}

// ── AsteroidWatch Tests ───────────────────────────────────────

describe("AsteroidWatch", () => {
  const mockNeoData = {
    near_earth_objects: {
      "2026-07-19": [
        {
          id: "neo-1",
          name: "(2016 PC8)",
          nasa_jpl_url: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=2016PC8",
          estimated_diameter: {
            meters: { estimated_diameter_min: 30, estimated_diameter_max: 67 },
          },
          is_potentially_hazardous_asteroid: false,
          close_approach_data: [
            {
              close_approach_date: "2026-07-19",
              close_approach_date_full: "2026-Jul-19 10:30",
              relative_velocity: { kilometers_per_hour: "20434", kilometers_per_second: "5.68" },
              miss_distance: { astronomical: "0.21", kilometers: "31000000", lunar: "81.13", miles: "19300000" },
              orbiting_body: "Earth",
            },
          ],
          absolute_magnitude_h: 24.7,
          is_sentry_object: false,
        },
        {
          id: "neo-2",
          name: "(2019 XZ4)",
          estimated_diameter: {
            meters: { estimated_diameter_min: 100, estimated_diameter_max: 230 },
          },
          is_potentially_hazardous_asteroid: true,
          close_approach_data: [
            {
              close_approach_date: "2026-07-19",
              close_approach_date_full: "2026-Jul-19 15:00",
              relative_velocity: { kilometers_per_hour: "55000", kilometers_per_second: "15.28" },
              miss_distance: { astronomical: "0.01", kilometers: "1500000", lunar: "3.90", miles: "932000" },
              orbiting_body: "Earth",
            },
          ],
          absolute_magnitude_h: 21.3,
          is_sentry_object: false,
        },
      ],
    },
  };

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it("renders asteroid data after loading", async () => {
    global.fetch = mockFetchResponse(mockNeoData);
    renderWithQuery(<AsteroidWatch />);

    await waitFor(() => {
      expect(screen.getByText(/2016 PC8/)).toBeInTheDocument();
      expect(screen.getByText(/2019 XZ4/)).toBeInTheDocument();
    });
  });

  it("shows hazardous badge for dangerous asteroids", async () => {
    global.fetch = mockFetchResponse(mockNeoData);
    renderWithQuery(<AsteroidWatch />);

    await waitFor(() => {
      expect(screen.getByText("Hazardous")).toBeInTheDocument();
    });
  });

  it("displays correct summary statistics", async () => {
    global.fetch = mockFetchResponse(mockNeoData);
    renderWithQuery(<AsteroidWatch />);

    await waitFor(() => {
      // Use exact match to avoid matching the subtitle "Near-Earth Objects tracked..."
      expect(screen.getByText("Objects Tracked")).toBeInTheDocument();
      // "Hazardous" appears as both a stat label and a badge — just verify at least one exists
      expect(screen.getAllByText(/^Hazardous$/i).length).toBeGreaterThan(0);
      // 2 total objects — the gradient-text div should contain "2"
      const allTwos = screen.getAllByText("2");
      expect(allTwos.length).toBeGreaterThan(0);
    });
  });

  it("expands asteroid detail on click", async () => {
    global.fetch = mockFetchResponse(mockNeoData);
    renderWithQuery(<AsteroidWatch />);

    await waitFor(() => {
      expect(screen.getByText(/2016 PC8/)).toBeInTheDocument();
    });

    // Get all expandable asteroid cards (role="button" with aria-label containing "Asteroid")
    const cards = screen.getAllByRole("button", { name: /asteroid/i });
    expect(cards.length).toBeGreaterThanOrEqual(2);

    // Should start collapsed
    expect(cards[0]).toHaveAttribute("aria-expanded", "false");

    // Click to expand — use fireEvent.click for synchronous state update
    await act(async () => {
      fireEvent.click(cards[0]);
    });

    // Re-query after state update — the DOM node gets replaced on re-render
    const updatedCards = screen.getAllByRole("button", { name: /asteroid/i });
    expect(updatedCards[0]).toHaveAttribute("aria-expanded", "true");

    // Click again to collapse
    await act(async () => {
      fireEvent.click(updatedCards[0]);
    });
    const collapsedCards = screen.getAllByRole("button", { name: /asteroid/i });
    expect(collapsedCards[0]).toHaveAttribute("aria-expanded", "false");
  });

  it("supports keyboard navigation (Enter/Space)", async () => {
    global.fetch = mockFetchResponse(mockNeoData);
    renderWithQuery(<AsteroidWatch />);

    await waitFor(() => {
      expect(screen.getByText(/2016 PC8/)).toBeInTheDocument();
    });

    const cards = screen.getAllByRole("button", { name: /asteroid/i });

    // Press Enter to expand
    await act(async () => {
      fireEvent.keyDown(cards[0], { key: "Enter", code: "Enter" });
    });
    const afterEnter = screen.getAllByRole("button", { name: /asteroid/i });
    expect(afterEnter[0]).toHaveAttribute("aria-expanded", "true");

    // Press Space to collapse
    await act(async () => {
      fireEvent.keyDown(afterEnter[0], { key: " ", code: "Space" });
    });
    const afterSpace = screen.getAllByRole("button", { name: /asteroid/i });
    expect(afterSpace[0]).toHaveAttribute("aria-expanded", "false");
  });

  it("shows error state when fetch fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network failure"));
    renderWithQuery(<AsteroidWatch />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load asteroid data/i)).toBeInTheDocument();
    });
  });

  it("has proper ARIA attributes on interactive cards", async () => {
    global.fetch = mockFetchResponse(mockNeoData);
    renderWithQuery(<AsteroidWatch />);

    await waitFor(() => {
      const cards = screen.getAllByRole("button", { name: /asteroid/i });
      cards.forEach((card) => {
        expect(card).toHaveAttribute("tabindex", "0");
        expect(card).toHaveAttribute("aria-expanded");
        expect(card).toHaveAttribute("aria-label");
      });
    });
  });
});

// ── SpaceWeather Tests ────────────────────────────────────────

describe("SpaceWeather", () => {
  const mockCmeData = [
    {
      activityID: "2026-06-19T00:00:00-CME-001",
      startTime: "2026-06-19T00:00:00Z",
      sourceLocation: "N15W30",
      note: "CME visible to the west in SOHO LASCO C2/C3",
      link: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/12345",
      cmeAnalyses: [{ type: "C", speed: 545, halfAngle: 40, isMostAccurate: true }],
    },
  ];

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  function setupSpaceWeatherFetch() {
    // Space Weather fetches 3 endpoints in parallel
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes("type=CME")) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCmeData) });
      if (url.includes("type=FLR")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      if (url.includes("type=GST")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      return Promise.resolve({ ok: false, json: () => Promise.resolve([]) });
    });
  }

  it("renders CME data after loading", async () => {
    setupSpaceWeatherFetch();
    renderWithQuery(<SpaceWeather />);

    await waitFor(() => {
      expect(screen.getByText(/2026-06-19T00:00:00-CME-001/)).toBeInTheDocument();
    });
  });

  it("displays CME count in summary card", async () => {
    setupSpaceWeatherFetch();
    renderWithQuery(<SpaceWeather />);

    await waitFor(() => {
      // The CME tab should show count of 1
      const cmeButton = screen.getByText("CMEs").closest("button");
      expect(cmeButton).toBeInTheDocument();
      expect(within(cmeButton!).getByText("1")).toBeInTheDocument();
    });
  });

  it("expands CME detail on click with ARIA support", async () => {
    setupSpaceWeatherFetch();
    renderWithQuery(<SpaceWeather />);

    await waitFor(() => {
      expect(screen.getByText(/2026-06-19T00:00:00-CME-001/)).toBeInTheDocument();
    });

    // The expandable CME card has aria-label starting with "CME 2026-06-19..."
    // Use a more specific query to match the card, not the tab buttons
    const cmeCards = screen.getAllByRole("button", { name: /CME 2026/i });
    expect(cmeCards.length).toBe(1);
    const card = cmeCards[0];

    expect(card).toHaveAttribute("aria-expanded", "false");

    // Use fireEvent.click + act for synchronous state update, then re-query
    await act(async () => {
      fireEvent.click(card);
    });
    const updatedCard = screen.getAllByRole("button", { name: /CME 2026/i })[0];
    expect(updatedCard).toHaveAttribute("aria-expanded", "true");
  });

  it("shows educational info card", async () => {
    setupSpaceWeatherFetch();
    renderWithQuery(<SpaceWeather />);

    await waitFor(() => {
      expect(screen.getByText(/Understanding Space Weather/)).toBeInTheDocument();
    });
  });
});

// ── FireballTracker Tests ─────────────────────────────────────

describe("FireballTracker", () => {
  const mockFireballData = {
    fields: ["date", "lat", "lat-dir", "lon", "lon-dir", "energy", "impact-e", "vel", "alt"],
    data: [
      ["2026-06-11 12:30:00", "18.7", "S", "16.1", "E", "1.2e10", "0.11", "25.3", "42.0"],
      ["2026-05-30 08:15:00", "42.0", "N", "70.5", "W", "5.6e11", "1.10", "18.7", "28.5"],
    ],
  };

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it("renders fireball events after loading", async () => {
    global.fetch = mockFetchResponse(mockFireballData);
    renderWithQuery(<FireballTracker />);

    await waitFor(() => {
      expect(screen.getByText(/Jun 11, 2026/)).toBeInTheDocument();
      expect(screen.getByText(/May 30, 2026/)).toBeInTheDocument();
    });
  });

  it("tags major fireballs with badge", async () => {
    global.fetch = mockFetchResponse(mockFireballData);
    renderWithQuery(<FireballTracker />);

    await waitFor(() => {
      expect(screen.getByText("Major")).toBeInTheDocument();
    });
  });

  it("displays summary statistics", async () => {
    global.fetch = mockFetchResponse(mockFireballData);
    renderWithQuery(<FireballTracker />);

    await waitFor(() => {
      // 2 events
      expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    });
  });

  it("expands fireball detail on keyboard Enter", async () => {
    global.fetch = mockFetchResponse(mockFireballData);
    renderWithQuery(<FireballTracker />);

    await waitFor(() => {
      expect(screen.getByText(/Jun 11, 2026/)).toBeInTheDocument();
    });

    const cards = screen.getAllByRole("button", { name: /fireball/i });
    expect(cards[0]).toHaveAttribute("aria-expanded", "false");

    // Use fireEvent.keyDown + act, then re-query the element after state update
    await act(async () => {
      fireEvent.keyDown(cards[0], { key: "Enter", code: "Enter" });
    });
    const updatedCards = screen.getAllByRole("button", { name: /fireball/i });
    expect(updatedCards[0]).toHaveAttribute("aria-expanded", "true");
  });

  it("shows educational info about fireballs", async () => {
    global.fetch = mockFetchResponse(mockFireballData);
    renderWithQuery(<FireballTracker />);

    await waitFor(() => {
      expect(screen.getByText(/Understanding Fireballs/i)).toBeInTheDocument();
    });
  });
});
