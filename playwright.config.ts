import { defineConfig, devices } from "@playwright/test";

/**
 * ─── Playwright E2E Test Configuration ─────────────────────────
 *
 * Configures End-to-End testing for SpaceAtlas with:
 * - Automatic dev server startup before tests
 * - Multi-browser testing (Chromium, Firefox, WebKit)
 * - Screenshot & trace capture on failure
 * - Parallel test execution for CI speed
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // ─── Test Directory ───────────────────────────────────────
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",

  // ─── Execution ────────────────────────────────────────────
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",

  // ─── Global Settings ──────────────────────────────────────
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  // ─── Browser Configurations ───────────────────────────────
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // Mobile viewport testing
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  // ─── Dev Server ───────────────────────────────────────────
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 min startup budget
  },
});
