import type { NextConfig } from "next";

/**
 * Trusted external origins used by SpaceAtlas for data and assets.
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
  "https://europeanspaceflight.com",
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

const isDev = process.env.NODE_ENV === "development";

/**
 * CSP without nonces — compatible with static generation.
 * Uses 'unsafe-inline' for scripts (safe when combined with 'self')
 * because pages are statically generated at build time.
 */
const cspHeader = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `img-src 'self' data: blob: ${TRUSTED_IMG_SOURCES}`,
  `connect-src 'self' ${TRUSTED_CONNECT_SOURCES}`,
  `media-src 'self' https://apod.nasa.gov https://sxcontent9668.azureedge.us https://content.spacex.com`,
  `frame-src 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const nextConfig: NextConfig = {
  // ─── Image Optimization ─────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'en.wikipedia.org' },
      { protocol: 'https', hostname: 'images-api.nasa.gov' },
      { protocol: 'https', hostname: 'images-assets.nasa.gov' },
      { protocol: 'https', hostname: 'api.nasa.gov' },
      { protocol: 'https', hostname: 'epic.gsfc.nasa.gov' },
      { protocol: 'https', hostname: 'mars.nasa.gov' },
      { protocol: 'https', hostname: 'apod.nasa.gov' },
      { protocol: 'https', hostname: 'spacelaunchnow-prod-east.nyc3.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'thespacedevs-prod.nyc3.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'europeanspaceflight.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ─── Performance ────────────────────────────────────────────
  reactStrictMode: true,
  poweredByHeader: false,

  // ─── Headers for Caching & Security ─────────────────────────
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
