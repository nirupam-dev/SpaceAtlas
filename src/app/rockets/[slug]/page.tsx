import { rockets } from "@/lib/data";
import NasaSearchFallback from "@/components/ui/NasaSearchFallback";
import RocketDetailClient from "./RocketDetailClient";
import type { Metadata } from "next";

// ─── Static Generation ─────────────────────────────────────────
export function generateStaticParams() {
  return rockets.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rocket = rockets.find((r) => r.slug === slug);
  if (!rocket) return { title: "Rocket Not Found | SpaceAtlas" };
  return {
    title: `${rocket.name} — ${rocket.manufacturer} | SpaceAtlas`,
    description: rocket.description.slice(0, 160),
    openGraph: {
      title: `${rocket.name} by ${rocket.manufacturer}`,
      description: rocket.description.slice(0, 160),
      images: rocket.imageUrl ? [rocket.imageUrl] : [],
    },
  };
}

// ─── Server Component Page ─────────────────────────────────────
export default async function RocketDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rocket = rockets.find((r) => r.slug === slug);

  if (!rocket) {
    return (
      <NasaSearchFallback
        query={slug}
        backLink="/rockets"
        backText="Back to Rockets"
      />
    );
  }

  // Find adjacent rockets for navigation
  const currentIndex = rockets.findIndex((r) => r.slug === slug);
  const prevRocket = currentIndex > 0 ? { name: rockets[currentIndex - 1].name, slug: rockets[currentIndex - 1].slug } : null;
  const nextRocket = currentIndex < rockets.length - 1 ? { name: rockets[currentIndex + 1].name, slug: rockets[currentIndex + 1].slug } : null;

  return (
    <RocketDetailClient
      rocket={rocket}
      prevRocket={prevRocket}
      nextRocket={nextRocket}
      allRockets={rockets}
    />
  );
}
