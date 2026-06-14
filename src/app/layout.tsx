import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "SpaceAtlas — Your Encyclopedia of the Cosmos",
    template: "%s | SpaceAtlas",
  },
  description:
    "Explore the cosmos with SpaceAtlas. Comprehensive information about rockets, spacecraft, planets, space missions, astronauts, and more.",
  keywords: [
    "space", "rockets", "NASA", "SpaceX", "ISRO", "planets", "solar system",
    "astronauts", "space missions", "launches", "spacecraft",
  ],
  openGraph: {
    title: "SpaceAtlas — Your Encyclopedia of the Cosmos",
    description: "Explore the cosmos with SpaceAtlas.",
    type: "website",
    locale: "en_US",
    siteName: "SpaceAtlas",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpaceAtlas",
    description: "Explore the cosmos with SpaceAtlas.",
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
      <body className={`${inter.variable} font-sans antialiased bg-space-900 text-space-100`}>
        <div className="relative min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
