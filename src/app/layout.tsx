import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: {
    default: "SpaceAtlas — AI-Powered Space Exploration Engine",
    template: "%s | SpaceAtlas",
  },
  description:
    "Explore the cosmos with SpaceAtlas. AI-powered semantic search across rockets, spacecraft, planets, space missions, astronauts, and more.",
  keywords: [
    "space", "rockets", "NASA", "SpaceX", "ISRO", "planets", "solar system",
    "astronauts", "space missions", "launches", "spacecraft", "AI", "semantic search",
  ],
  openGraph: {
    title: "SpaceAtlas — AI-Powered Space Exploration Engine",
    description: "Explore the cosmos with SpaceAtlas.",
    type: "website",
    locale: "en_US",
    siteName: "SpaceAtlas",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpaceAtlas",
    description: "AI-powered space exploration engine.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Performance: preconnect to external APIs */}
        <link rel="preconnect" href="https://images-api.nasa.gov" />
        <link rel="preconnect" href="https://api.nasa.gov" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://upload.wikimedia.org" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-space-900 text-space-100`} suppressHydrationWarning>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent-blue focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
          Skip to main content
        </a>
        <div className="relative min-h-screen flex flex-col">
          <ScrollProgress />
          <Navbar />
          <main id="main-content" className="flex-1" role="main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

