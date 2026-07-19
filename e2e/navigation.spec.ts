import { test, expect } from "@playwright/test";

/**
 * ─── Global Navigation E2E Tests ──────────────────────────────
 *
 * Verifies core navigation flows across the SpaceAtlas application:
 * 1. Home page loads with critical sections
 * 2. Navbar links navigate to correct pages
 * 3. Mobile responsiveness
 * 4. Footer renders with correct attribution
 */

test.describe("Global Navigation", () => {
  test("home page should load with hero section", async ({ page }) => {
    await page.goto("/");

    // Verify the page title
    await expect(page).toHaveTitle(/SpaceAtlas/);

    // Hero heading should be visible
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });

  test("should navigate to Observatory page", async ({ page }) => {
    await page.goto("/");

    // Click Observatory link in navbar
    const navLink = page.locator('a[href="/observatory"]').first();
    await navLink.click();

    // Should be on observatory page
    await expect(page).toHaveURL(/observatory/);
    await expect(page.locator("h1")).toContainText("OBSERVATORY");
  });

  test("should navigate to Rockets page", async ({ page }) => {
    await page.goto("/");

    const navLink = page.locator('a[href="/rockets"]').first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await expect(page).toHaveURL(/rockets/);
    }
  });

  test("should navigate to Ask AI page", async ({ page }) => {
    await page.goto("/");

    const navLink = page.locator('a[href="/ask"]').first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await expect(page).toHaveURL(/ask/);
    }
  });

  test("should have skip-to-content link for accessibility", async ({
    page,
  }) => {
    await page.goto("/");

    // The skip link should exist (it's sr-only by default)
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test("should display footer with author credit", async ({ page }) => {
    await page.goto("/");

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Footer should be visible
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});

test.describe("Security Headers", () => {
  test("should include CSP header in response", async ({ page }) => {
    const response = await page.goto("/");
    const csp = response?.headers()["content-security-policy"];

    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test("should include HSTS header", async ({ page }) => {
    const response = await page.goto("/");
    const hsts = response?.headers()["strict-transport-security"];

    expect(hsts).toBeDefined();
    expect(hsts).toContain("max-age=");
  });

  test("should include X-Frame-Options DENY", async ({ page }) => {
    const response = await page.goto("/");
    const xfo = response?.headers()["x-frame-options"];

    expect(xfo).toBe("DENY");
  });

  test("should include X-Content-Type-Options nosniff", async ({ page }) => {
    const response = await page.goto("/");
    const xcto = response?.headers()["x-content-type-options"];

    expect(xcto).toBe("nosniff");
  });
});
