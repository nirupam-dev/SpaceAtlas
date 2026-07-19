/**
 * ─── Security Middleware ──────────────────────────────────────
 *
 * Implements enterprise-grade security headers including:
 * - Strict-Transport-Security (HSTS) — enforces HTTPS
 * - X-Frame-Options — prevents clickjacking
 * - X-Content-Type-Options — prevents MIME sniffing
 * - Referrer-Policy — controls referrer information
 * - Permissions-Policy — restricts browser features
 *
 * Note: CSP is configured in next.config.ts via static headers
 * because pages are statically generated (no per-request nonce).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ─── Set Security Headers on Response ─────────────────────
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
