/**
 * ─── Security Middleware ──────────────────────────────────────
 *
 * Implements enterprise-grade security headers including:
 * - Content Security Policy (CSP) — prevents XSS attacks
 * - Strict-Transport-Security (HSTS) — enforces HTTPS
 * - X-Frame-Options — prevents clickjacking
 * - X-Content-Type-Options — prevents MIME sniffing
 * - Referrer-Policy — controls referrer information
 * - Permissions-Policy — restricts browser features
 *
 * CSP is configured with a nonce-based approach for inline scripts
 * and strict source allowlists for all external resources.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Trusted external origins used by SpaceAtlas for data and assets.
 * These are the ONLY external origins allowed in the CSP.
 */
const TRUSTED_IMG_SOURCES = [
  "https://images-api.nasa.gov",
  "https://images-assets.nasa.gov",
  "https://api.nasa.gov",
  "https://epic.gsfc.nasa.gov",
  "https://mars.nasa.gov",
  "https://apod.nasa.gov",
  "https://images.unsplash.com",
  "https://upload.wikimedia.org",
  "https://en.wikipedia.org",
  "https://spacelaunchnow-prod-east.nyc3.digitaloceanspaces.com",
  "https://thespacedevs-prod.nyc3.digitaloceanspaces.com",
].join(" ");

const TRUSTED_CONNECT_SOURCES = [
  "https://api.nasa.gov",
  "https://images-api.nasa.gov",
  "https://ssd-api.jpl.nasa.gov",
  "https://eonet.gsfc.nasa.gov",
  "https://exoplanetarchive.ipac.caltech.edu",
  "https://ll.thespacedevs.com",
  "https://api.spaceflightnewsapi.net",
  "https://generativelanguage.googleapis.com",
  "https://vitals.vercel-insights.com",
].join(" ");

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // ─── Content Security Policy ──────────────────────────────
  const isDev = process.env.NODE_ENV === "development";
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: ${TRUSTED_IMG_SOURCES}`,
    `connect-src 'self' ${TRUSTED_CONNECT_SOURCES}`,
    `media-src 'self' https://apod.nasa.gov`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  // ─── Set Security Headers ─────────────────────────────────
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Pass nonce to the request headers so Server Components can use it
  response.headers.set("x-nonce", nonce);

  return response;
}

/**
 * Apply security headers to all routes except static assets and images.
 */
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets (images, fonts)
     */
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
