import { HorizonHeroSection } from "@/components/ui/horizon-hero-section";

/**
 * Home page — rendered as a **Server Component**.
 *
 * Static data (rockets, agencies, etc.) is resolved on the server and passed
 * to thin client islands that handle animations and interactivity.
 * This prevents the ~140 KB data.ts payload from being bundled into client JS.
 */
export default function HomePage() {
  return <HorizonHeroSection />;
}
