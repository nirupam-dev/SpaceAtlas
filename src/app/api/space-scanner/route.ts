// SpaceAtlas — Space Scanner: Object Info API
// Looks up detected objects in SpaceAtlas database first,
// then falls back to Wikipedia API for objects not in the database.

import { NextRequest, NextResponse } from "next/server";
import { rockets } from "@/lib/data";
import { planets } from "@/lib/data";
import { missions } from "@/lib/data";

// ── Mapping from ML class names → SpaceAtlas data lookups ─────

interface ObjectMapping {
  /** Slug to look up in SpaceAtlas data */
  slug: string;
  /** Which data collection to search */
  source: "planets" | "rockets" | "missions" | "wikipedia";
  /** Wikipedia article title (used as fallback or primary for wikipedia source) */
  wikiTitle?: string;
  /** Display name */
  displayName: string;
}

const CLASS_MAPPINGS: Record<string, ObjectMapping> = {
  // ── Planets (in SpaceAtlas planets array) ──
  mercury: { slug: "mercury", source: "planets", displayName: "Mercury", wikiTitle: "Mercury_(planet)" },
  venus: { slug: "venus", source: "planets", displayName: "Venus", wikiTitle: "Venus" },
  earth: { slug: "earth", source: "planets", displayName: "Earth", wikiTitle: "Earth" },
  mars: { slug: "mars", source: "planets", displayName: "Mars", wikiTitle: "Mars" },
  jupiter: { slug: "jupiter", source: "planets", displayName: "Jupiter", wikiTitle: "Jupiter" },
  saturn: { slug: "saturn", source: "planets", displayName: "Saturn", wikiTitle: "Saturn" },
  uranus: { slug: "uranus", source: "planets", displayName: "Uranus", wikiTitle: "Uranus" },
  neptune: { slug: "neptune", source: "planets", displayName: "Neptune", wikiTitle: "Neptune" },
  pluto: { slug: "pluto", source: "planets", displayName: "Pluto", wikiTitle: "Pluto" },

  // ── Moons (in SpaceAtlas planets array as type MOON) ──
  moon: { slug: "moon", source: "planets", displayName: "The Moon", wikiTitle: "Moon" },
  europa: { slug: "europa", source: "planets", displayName: "Europa", wikiTitle: "Europa_(moon)" },
  titan: { slug: "titan", source: "planets", displayName: "Titan", wikiTitle: "Titan_(moon)" },
  io: { slug: "io", source: "wikipedia", displayName: "Io", wikiTitle: "Io_(moon)" },

  // ── Sun ──
  sun: { slug: "sun", source: "wikipedia", displayName: "The Sun", wikiTitle: "Sun" },

  // ── Rockets (in SpaceAtlas rockets array) ──
  falcon_9: { slug: "falcon-9", source: "rockets", displayName: "Falcon 9", wikiTitle: "Falcon_9" },
  space_shuttle: { slug: "space-shuttle", source: "rockets", displayName: "Space Shuttle", wikiTitle: "Space_Shuttle" },
  saturn_v: { slug: "saturn-v", source: "rockets", displayName: "Saturn V", wikiTitle: "Saturn_V" },
  starship: { slug: "starship", source: "rockets", displayName: "Starship", wikiTitle: "SpaceX_Starship" },
  sls: { slug: "sls", source: "rockets", displayName: "Space Launch System", wikiTitle: "Space_Launch_System" },
  soyuz: { slug: "soyuz-2", source: "rockets", displayName: "Soyuz", wikiTitle: "Soyuz-2" },

  // ── Space Structures ──
  iss: { slug: "iss", source: "wikipedia", displayName: "International Space Station", wikiTitle: "International_Space_Station" },
  hubble_telescope: { slug: "hubble", source: "wikipedia", displayName: "Hubble Space Telescope", wikiTitle: "Hubble_Space_Telescope" },
  jwst: { slug: "james-webb", source: "missions", displayName: "James Webb Space Telescope", wikiTitle: "James_Webb_Space_Telescope" },

  // ── Galaxies (Wikipedia only) ──
  andromeda_galaxy: { slug: "andromeda", source: "wikipedia", displayName: "Andromeda Galaxy", wikiTitle: "Andromeda_Galaxy" },
  milky_way: { slug: "milky-way", source: "wikipedia", displayName: "Milky Way", wikiTitle: "Milky_Way" },

  // ── Nebulae (Wikipedia only) ──
  orion_nebula: { slug: "orion-nebula", source: "wikipedia", displayName: "Orion Nebula", wikiTitle: "Orion_Nebula" },
  pillars_of_creation: { slug: "pillars", source: "wikipedia", displayName: "Pillars of Creation", wikiTitle: "Pillars_of_Creation" },
  crab_nebula: { slug: "crab-nebula", source: "wikipedia", displayName: "Crab Nebula", wikiTitle: "Crab_Nebula" },
  carina_nebula: { slug: "carina-nebula", source: "wikipedia", displayName: "Carina Nebula", wikiTitle: "Carina_Nebula" },

  // ── Phenomena (Wikipedia only) ──
  black_hole: { slug: "black-hole", source: "wikipedia", displayName: "Black Hole", wikiTitle: "Black_hole" },
  comet: { slug: "comet", source: "wikipedia", displayName: "Comet", wikiTitle: "Comet" },
  asteroid: { slug: "asteroid", source: "wikipedia", displayName: "Asteroid", wikiTitle: "Asteroid" },

  // ── Surface / Rovers ──
  mars_rover: { slug: "mars-rover", source: "wikipedia", displayName: "Mars Rover", wikiTitle: "Mars_rover" },
  lunar_lander: { slug: "lunar-lander", source: "wikipedia", displayName: "Lunar Lander", wikiTitle: "Lunar_lander" },
};


// ── Wikipedia API fetch ───────────────────────────────────────

interface WikiSummary {
  title: string;
  description: string;
  extract: string;
  thumbnail?: { source: string; width: number; height: number };
  content_urls?: { desktop: { page: string } };
}

async function fetchWikipedia(title: string): Promise<WikiSummary | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "SpaceAtlas/1.0 (educational project)" },
      next: { revalidate: 86400 }, // Cache for 24h
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}


// ── Build unified response ────────────────────────────────────

interface SpaceScannerResult {
  found: boolean;
  source: "spaceatlas" | "wikipedia";
  displayName: string;
  description: string;
  imageUrl: string;
  wikiUrl?: string;
  spaceatlasPath?: string;
  details: Record<string, string | number | boolean>;
}

function lookupSpaceAtlas(mapping: ObjectMapping): SpaceScannerResult | null {
  if (mapping.source === "planets") {
    const planet = planets.find((p) => p.slug === mapping.slug);
    if (planet) {
      return {
        found: true,
        source: "spaceatlas",
        displayName: planet.name,
        description: planet.description,
        imageUrl: planet.imageUrl,
        spaceatlasPath: `/solar-system/${planet.slug}`,
        details: {
          type: planet.type,
          mass: `${planet.mass} × 10²⁴ kg`,
          diameter: `${planet.diameter.toLocaleString()} km`,
          gravity: `${planet.gravity} m/s²`,
          distanceFromSun: `${planet.distanceFromSun} million km`,
          orbitalPeriod: `${planet.orbitalPeriod} days`,
          meanTemperature: `${planet.meanTemperature}°C`,
          numberOfMoons: planet.numberOfMoons,
          hasRings: planet.hasRings,
        },
      };
    }
  }

  if (mapping.source === "rockets") {
    const rocket = rockets.find((r) => r.slug === mapping.slug);
    if (rocket) {
      return {
        found: true,
        source: "spaceatlas",
        displayName: rocket.name,
        description: rocket.description,
        imageUrl: rocket.imageUrl,
        spaceatlasPath: `/rockets/${rocket.slug}`,
        details: {
          manufacturer: rocket.manufacturer,
          country: rocket.country,
          status: rocket.status,
          height: `${rocket.height} m`,
          diameter: `${rocket.diameter} m`,
          mass: `${rocket.mass.toLocaleString()} kg`,
          payloadToLEO: `${rocket.payloadToLEO.toLocaleString()} kg`,
          stages: rocket.stages,
          engines: rocket.engines,
          thrust: `${rocket.thrust.toLocaleString()} kN`,
          successRate: `${rocket.successRate}%`,
          totalLaunches: rocket.totalLaunches,
        },
      };
    }
  }

  if (mapping.source === "missions") {
    const mission = missions.find((m) => m.slug === mapping.slug);
    if (mission) {
      return {
        found: true,
        source: "spaceatlas",
        displayName: mission.name,
        description: mission.description,
        imageUrl: mission.imageUrl,
        spaceatlasPath: `/missions/${mission.slug}`,
        details: {
          agency: mission.agency,
          destination: mission.destination,
          launchDate: mission.launchDate,
          status: mission.status,
        },
      };
    }
  }

  return null;
}


// ── API Route Handler ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  const className = req.nextUrl.searchParams.get("class");

  if (!className) {
    return NextResponse.json(
      { error: "Missing 'class' query parameter" },
      { status: 400 }
    );
  }

  const mapping = CLASS_MAPPINGS[className];

  if (!mapping) {
    // Unknown class — try Wikipedia with the raw class name
    const wiki = await fetchWikipedia(className.replace(/_/g, " "));
    if (wiki) {
      return NextResponse.json({
        found: true,
        source: "wikipedia",
        displayName: wiki.title,
        description: wiki.extract,
        imageUrl: wiki.thumbnail?.source || "",
        wikiUrl: wiki.content_urls?.desktop?.page || "",
        details: { description: wiki.description || "" },
      });
    }
    return NextResponse.json({ found: false, error: "Object not found" }, { status: 404 });
  }

  // Step 1: Try SpaceAtlas database
  const atlasResult = lookupSpaceAtlas(mapping);
  if (atlasResult) {
    return NextResponse.json(atlasResult);
  }

  // Step 2: Fall back to Wikipedia
  if (mapping.wikiTitle) {
    const wiki = await fetchWikipedia(mapping.wikiTitle);
    if (wiki) {
      return NextResponse.json({
        found: true,
        source: "wikipedia",
        displayName: mapping.displayName,
        description: wiki.extract,
        imageUrl: wiki.thumbnail?.source || "",
        wikiUrl: wiki.content_urls?.desktop?.page || "",
        spaceatlasPath: undefined,
        details: { description: wiki.description || "" },
      });
    }
  }

  return NextResponse.json({ found: false, error: "Object not found" }, { status: 404 });
}
