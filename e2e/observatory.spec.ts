import { test, expect } from "@playwright/test";

/**
 * ─── Observatory E2E Tests ────────────────────────────────────
 *
 * Critical user journeys for the Space Observatory page:
 * 1. Page loads and hero section renders
 * 2. People in Space widget shows live data
 * 3. Tab navigation works and loads live data
 * 4. Tab switching renders correct content panels
 *
 * These tests run against a real browser to verify the full
 * data pipeline: Client → API Route → External API → UI render.
 */

test.describe("Observatory Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/observatory");
  });

  // ─── Hero Section ───────────────────────────────────────────

  test("should render the hero section with correct heading", async ({
    page,
  }) => {
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("OBSERVATORY");
  });

  test("should display API source badges", async ({ page }) => {
    const badges = page.locator("text=NASA NEO");
    await expect(badges.first()).toBeVisible();
  });

  test("should have a working 'START OBSERVING' CTA", async ({ page }) => {
    const cta = page.locator('a[href="#explore"]');
    await expect(cta).toBeVisible();
    await expect(cta).toContainText("START OBSERVING");
  });

  // ─── People in Space Widget ─────────────────────────────────

  test("should load People in Space widget with live data", async ({
    page,
  }) => {
    // Wait for the widget to finish loading (spinner disappears)
    const widget = page.locator("text=People in Space");
    await expect(widget).toBeVisible({ timeout: 15000 });

    // Should show at least one astronaut name
    const crewSection = page.locator("text=ISS").first();
    await expect(crewSection).toBeVisible({ timeout: 15000 });
  });

  // ─── Tab Navigation ────────────────────────────────────────

  test("should display all observatory tabs", async ({ page }) => {
    const tabLabels = [
      "Live Launches",
      "Asteroid Watch",
      "Space Weather",
      "Exoplanets",
      "Earth Events",
      "Fireballs",
    ];

    for (const label of tabLabels) {
      const tab = page.locator(`button:has-text("${label}")`);
      await expect(tab).toBeVisible();
    }
  });

  test("should show Live Launches tab by default", async ({ page }) => {
    // The 'Live Launches' tab should be active (has special styling)
    const launchesTab = page.locator('button:has-text("Live Launches")');
    await expect(launchesTab).toBeVisible();

    // Content area should have launch-related content
    const launchContent = page.locator("text=UPCOMING LAUNCHES");
    await expect(launchContent).toBeVisible({ timeout: 15000 });
  });

  test("should switch to Asteroid Watch tab and render data", async ({
    page,
  }) => {
    // Click the Asteroid Watch tab
    await page.click('button:has-text("Asteroid Watch")');

    // Wait for asteroid content to load
    const asteroidHeading = page.locator("text=ASTEROID WATCH");
    await expect(asteroidHeading).toBeVisible({ timeout: 15000 });

    // Should show the summary cards
    const objectsTracked = page.locator("text=Objects Tracked");
    await expect(objectsTracked).toBeVisible({ timeout: 15000 });
  });

  test("should switch to Space Weather tab and render data", async ({
    page,
  }) => {
    await page.click('button:has-text("Space Weather")');

    const weatherHeading = page.locator("text=SPACE WEATHER");
    await expect(weatherHeading).toBeVisible({ timeout: 15000 });

    // Should show the sub-tabs (CMEs, Flares, Storms)
    const cmesTab = page.locator("text=CMEs");
    await expect(cmesTab).toBeVisible({ timeout: 15000 });
  });

  test("should switch to Exoplanets tab and render data", async ({ page }) => {
    await page.click('button:has-text("Exoplanets")');

    const heading = page.locator("text=EXOPLANET EXPLORER");
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Should show the search input
    const searchInput = page.locator(
      'input[placeholder*="Search planets"]'
    );
    await expect(searchInput).toBeVisible({ timeout: 15000 });
  });

  test("should switch to Earth Events tab and render data", async ({
    page,
  }) => {
    await page.click('button:has-text("Earth Events")');

    const heading = page.locator("text=EARTH EVENTS");
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test("should switch to Fireballs tab and render data", async ({ page }) => {
    await page.click('button:has-text("Fireballs")');

    const heading = page.locator("text=FIREBALL TRACKER");
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  // ─── Rapid Tab Switching (Race Condition Test) ──────────────

  test("should handle rapid tab switching without crashes", async ({
    page,
  }) => {
    const tabs = [
      "Asteroid Watch",
      "Space Weather",
      "Exoplanets",
      "Earth Events",
      "Fireballs",
      "Live Launches",
    ];

    // Rapidly switch through all tabs
    for (const tab of tabs) {
      await page.click(`button:has-text("${tab}")`);
      // Small delay to trigger concurrent fetches
      await page.waitForTimeout(200);
    }

    // Final tab should be Live Launches — verify it renders correctly
    const launchContent = page.locator("text=UPCOMING LAUNCHES");
    await expect(launchContent).toBeVisible({ timeout: 15000 });
  });
});
