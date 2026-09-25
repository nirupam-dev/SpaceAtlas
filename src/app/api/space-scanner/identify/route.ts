// SpaceAtlas — Click-to-Identify API
// Accepts an image + click coordinates, identifies the object at that location.
// Tier 1: Custom YOLOv8 model (when available)
// Tier 2: Google Gemini Multimodal Vision AI (fallback / primary)
// Knowledge: SpaceAtlas DB → Wikipedia REST API

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rockets, planets, missions } from "@/lib/data";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"] as const;

// ── Known Class Mappings ──────────────────────────────────────

interface ObjectMapping {
  slug: string;
  source: "planets" | "rockets" | "missions" | "wikipedia";
  displayName: string;
  wikiTitle?: string;
}

const CLASS_MAPPINGS: Record<string, ObjectMapping> = {
  mercury: { slug: "mercury", source: "planets", displayName: "Mercury", wikiTitle: "Mercury_(planet)" },
  venus: { slug: "venus", source: "planets", displayName: "Venus", wikiTitle: "Venus" },
  earth: { slug: "earth", source: "planets", displayName: "Earth", wikiTitle: "Earth" },
  mars: { slug: "mars", source: "planets", displayName: "Mars", wikiTitle: "Mars" },
  jupiter: { slug: "jupiter", source: "planets", displayName: "Jupiter", wikiTitle: "Jupiter" },
  saturn: { slug: "saturn", source: "planets", displayName: "Saturn", wikiTitle: "Saturn" },
  uranus: { slug: "uranus", source: "planets", displayName: "Uranus", wikiTitle: "Uranus" },
  neptune: { slug: "neptune", source: "planets", displayName: "Neptune", wikiTitle: "Neptune" },
  pluto: { slug: "pluto", source: "planets", displayName: "Pluto", wikiTitle: "Pluto" },
  moon: { slug: "moon", source: "planets", displayName: "The Moon", wikiTitle: "Moon" },
  europa: { slug: "europa", source: "planets", displayName: "Europa", wikiTitle: "Europa_(moon)" },
  titan: { slug: "titan", source: "planets", displayName: "Titan", wikiTitle: "Titan_(moon)" },
  io: { slug: "io", source: "wikipedia", displayName: "Io", wikiTitle: "Io_(moon)" },
  ganymede: { slug: "ganymede", source: "wikipedia", displayName: "Ganymede", wikiTitle: "Ganymede_(moon)" },
  callisto: { slug: "callisto", source: "wikipedia", displayName: "Callisto", wikiTitle: "Callisto_(moon)" },
  enceladus: { slug: "enceladus", source: "wikipedia", displayName: "Enceladus", wikiTitle: "Enceladus" },
  triton: { slug: "triton", source: "wikipedia", displayName: "Triton", wikiTitle: "Triton_(moon)" },
  phobos: { slug: "phobos", source: "wikipedia", displayName: "Phobos", wikiTitle: "Phobos_(moon)" },
  sun: { slug: "sun", source: "wikipedia", displayName: "The Sun", wikiTitle: "Sun" },
  falcon_9: { slug: "falcon-9", source: "rockets", displayName: "Falcon 9", wikiTitle: "Falcon_9" },
  space_shuttle: { slug: "space-shuttle", source: "rockets", displayName: "Space Shuttle", wikiTitle: "Space_Shuttle" },
  saturn_v: { slug: "saturn-v", source: "rockets", displayName: "Saturn V", wikiTitle: "Saturn_V" },
  starship: { slug: "starship", source: "rockets", displayName: "Starship", wikiTitle: "SpaceX_Starship" },
  sls: { slug: "sls", source: "rockets", displayName: "Space Launch System", wikiTitle: "Space_Launch_System" },
  soyuz: { slug: "soyuz-2", source: "rockets", displayName: "Soyuz", wikiTitle: "Soyuz-2" },
  iss: { slug: "iss", source: "wikipedia", displayName: "International Space Station", wikiTitle: "International_Space_Station" },
  hubble_telescope: { slug: "hubble", source: "wikipedia", displayName: "Hubble Space Telescope", wikiTitle: "Hubble_Space_Telescope" },
  jwst: { slug: "james-webb", source: "missions", displayName: "James Webb Space Telescope", wikiTitle: "James_Webb_Space_Telescope" },
  andromeda_galaxy: { slug: "andromeda", source: "wikipedia", displayName: "Andromeda Galaxy", wikiTitle: "Andromeda_Galaxy" },
  milky_way: { slug: "milky-way", source: "wikipedia", displayName: "Milky Way", wikiTitle: "Milky_Way" },
  whirlpool_galaxy: { slug: "whirlpool", source: "wikipedia", displayName: "Whirlpool Galaxy", wikiTitle: "Whirlpool_Galaxy" },
  orion_nebula: { slug: "orion-nebula", source: "wikipedia", displayName: "Orion Nebula", wikiTitle: "Orion_Nebula" },
  pillars_of_creation: { slug: "pillars", source: "wikipedia", displayName: "Pillars of Creation", wikiTitle: "Pillars_of_Creation" },
  crab_nebula: { slug: "crab-nebula", source: "wikipedia", displayName: "Crab Nebula", wikiTitle: "Crab_Nebula" },
  carina_nebula: { slug: "carina-nebula", source: "wikipedia", displayName: "Carina Nebula", wikiTitle: "Carina_Nebula" },
  black_hole: { slug: "black-hole", source: "wikipedia", displayName: "Black Hole", wikiTitle: "Black_hole" },
  comet: { slug: "comet", source: "wikipedia", displayName: "Comet", wikiTitle: "Comet" },
  asteroid: { slug: "asteroid", source: "wikipedia", displayName: "Asteroid", wikiTitle: "Asteroid" },
  mars_rover: { slug: "mars-rover", source: "wikipedia", displayName: "Mars Rover", wikiTitle: "Mars_rover" },
  lunar_lander: { slug: "lunar-lander", source: "wikipedia", displayName: "Lunar Lander", wikiTitle: "Lunar_lander" },
};

// ── Knowledge Resolution ──────────────────────────────────────

async function fetchWikipediaKnowledge(wikiTitle: string, fallbackName: string) {
  try {
    const encoded = encodeURIComponent(wikiTitle.replace(/\s+/g, "_"));
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "SpaceAtlas/1.0 (educational astrophysics app)" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      found: true,
      source: "wikipedia" as const,
      displayName: data.title || fallbackName,
      description: data.extract || `Astronomical entity: ${fallbackName}`,
      imageUrl: data.originalimage?.source || data.thumbnail?.source || "",
      wikiUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encoded}`,
      details: {
        Description: data.description || "Celestial body or space object",
      },
    };
  } catch {
    return null;
  }
}

async function resolveKnowledge(canonicalKey: string, displayName: string) {
  const mapping = CLASS_MAPPINGS[canonicalKey.toLowerCase()];

  // 1. SpaceAtlas Planets
  if (mapping?.source === "planets" || !mapping) {
    const planet = planets.find(
      (p) =>
        p.slug.toLowerCase() === (mapping?.slug || canonicalKey).toLowerCase() ||
        p.name.toLowerCase() === displayName.toLowerCase()
    );
    if (planet) {
      return {
        found: true,
        source: "spaceatlas" as const,
        displayName: planet.name,
        description: planet.description,
        imageUrl: planet.imageUrl,
        spaceatlasPath: `/solar-system/${planet.slug}`,
        details: {
          Type: planet.type,
          Mass: `${planet.mass} × 10²⁴ kg`,
          Diameter: `${planet.diameter.toLocaleString()} km`,
          Gravity: `${planet.gravity} m/s²`,
          "Orbital Period": `${planet.orbitalPeriod} days`,
          Moons: planet.numberOfMoons,
          "Mean Temperature": `${planet.meanTemperature}°C`,
        },
      };
    }
  }

  // 2. SpaceAtlas Rockets
  if (mapping?.source === "rockets" || !mapping) {
    const rocket = rockets.find(
      (r) =>
        r.slug.toLowerCase() === (mapping?.slug || canonicalKey).toLowerCase() ||
        r.name.toLowerCase().includes(displayName.toLowerCase())
    );
    if (rocket) {
      return {
        found: true,
        source: "spaceatlas" as const,
        displayName: rocket.name,
        description: rocket.description,
        imageUrl: rocket.imageUrl,
        spaceatlasPath: `/rockets/${rocket.slug}`,
        details: {
          Manufacturer: rocket.manufacturer,
          Country: rocket.country,
          Status: rocket.status,
          Height: `${rocket.height} m`,
          Diameter: `${rocket.diameter} m`,
          Mass: `${rocket.mass.toLocaleString()} kg`,
          Stages: rocket.stages,
          "Payload to LEO": `${rocket.payloadToLEO.toLocaleString()} kg`,
        },
      };
    }
  }

  // 3. SpaceAtlas Missions
  if (mapping?.source === "missions" || !mapping) {
    const mission = missions.find(
      (m) =>
        m.slug.toLowerCase() === (mapping?.slug || canonicalKey).toLowerCase() ||
        m.name.toLowerCase().includes(displayName.toLowerCase())
    );
    if (mission) {
      return {
        found: true,
        source: "spaceatlas" as const,
        displayName: mission.name,
        description: mission.description,
        imageUrl: mission.imageUrl,
        spaceatlasPath: `/missions/${mission.slug}`,
        details: {
          Agency: mission.agency,
          Status: mission.status,
          Destination: mission.destination,
          "Launch Date": mission.launchDate,
        },
      };
    }
  }

  // 4. Wikipedia fallback
  const wikiTitle = mapping?.wikiTitle || displayName || canonicalKey;
  const wikiData = await fetchWikipediaKnowledge(wikiTitle, displayName);
  if (wikiData) return wikiData;

  // 5. Generic fallback
  return {
    found: true,
    source: "wikipedia" as const,
    displayName: displayName,
    description: `${displayName} is an astronomical object or space-related subject.`,
    imageUrl: "",
    wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(displayName.replace(/\s+/g, "_"))}`,
    details: { Classification: "Astronomical Target" },
  };
}

// ── Main Identify POST Handler ────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clickX, clickY, mimeType: rawMimeType } = body;
    let { image: rawImage } = body;
    let mimeType = rawMimeType || "image/jpeg";
    let base64Image = "";

    // Validate click coordinates
    if (typeof clickX !== "number" || typeof clickY !== "number") {
      return NextResponse.json(
        { error: "Missing clickX/clickY coordinates (0-1 normalized)" },
        { status: 400 }
      );
    }

    // Parse image
    if (!rawImage) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    if (rawImage.startsWith("data:")) {
      // Data URL — extract base64 portion
      mimeType = rawImage.substring(rawImage.indexOf(":") + 1, rawImage.indexOf(";"));
      base64Image = rawImage.split(",")[1];
    } else if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
      // Remote URL — fetch and convert
      try {
        const imgRes = await fetch(rawImage, { headers: { "User-Agent": "SpaceAtlas/1.0" } });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          base64Image = buf.toString("base64");
          const cType = imgRes.headers.get("content-type");
          if (cType) mimeType = cType;
        }
      } catch (e) {
        console.error("Failed to fetch image URL:", e);
      }
    } else {
      // Raw base64
      base64Image = rawImage;
    }

    if (!base64Image) {
      return NextResponse.json({ error: "Could not process image" }, { status: 400 });
    }

    // ──────────────────────────────────────────────────────────
    // TIER 2: Gemini Multimodal Vision — Click-to-Identify
    // (Tier 1 YOLO integration will be added once model is trained)
    // ──────────────────────────────────────────────────────────

    let geminiResponseText = "";
    let lastError: unknown = null;

    const clickXPct = (clickX * 100).toFixed(1);
    const clickYPct = (clickY * 100).toFixed(1);

    for (const modelName of GEMINI_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const prompt = `You are the SpaceAtlas Visual Identification Engine — a Google Lens-style object identification system for astronomical and aerospace imagery.

The user has uploaded an image and clicked at position (${clickXPct}% from left, ${clickYPct}% from top).

TASK: Identify the object located at or near the clicked position.

RULES:
1. Focus on the object AT the click point. If a distinct object (planet, rocket, nebula, moon, spacecraft, star, galaxy, etc.) is located at or near that position, identify it.
2. If the click is on a background area (empty sky, black space, featureless ground, out-of-focus area) with NO identifiable object, set "noObject" to true.
3. Estimate a bounding box around the identified object in normalized coordinates (0-1 range).
4. Provide a confident identification — use exact names when possible (e.g., "Jupiter" not "a gas giant planet").
5. Generate 3 suggested follow-up questions the user might ask about this object.

Respond strictly in JSON:
{
  "noObject": false,
  "objectName": "Exact object name (e.g. Jupiter, Falcon 9, Crab Nebula)",
  "canonicalClass": "snake_case_id (e.g. jupiter, falcon_9, crab_nebula)",
  "confidence": 0.95,
  "category": "planet | moon | star | rocket | spacecraft | telescope | nebula | galaxy | phenomenon | rover | lander | other",
  "bbox": [x_min, y_min, x_max, y_max],
  "observation": "A precise 2-sentence description of what is visible at the clicked location and why this identification was made.",
  "suggestedQuestions": ["Question 1?", "Question 2?", "Question 3?"]
}

If noObject is true, respond:
{
  "noObject": true,
  "message": "Brief explanation of why no object was detected (e.g., 'The clicked area appears to be empty space/dark background with no identifiable astronomical object.')"
}`;

        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Image, mimeType } },
        ]);

        geminiResponseText = result.response.text();
        if (geminiResponseText) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!geminiResponseText) {
      throw new Error(`Vision AI failed: ${(lastError as Error)?.message || "Unknown error"}`);
    }

    const parsed = JSON.parse(geminiResponseText);

    // ── Handle: No object at click point ──
    if (parsed.noObject) {
      return NextResponse.json({
        identified: false,
        noObject: true,
        message: parsed.message || "No identifiable object at this location.",
        clickPosition: { x: clickX, y: clickY },
      });
    }

    // ── Handle: Object identified ──
    const objectName = parsed.objectName || "Unknown Object";
    const canonicalClass = (parsed.canonicalClass || objectName.toLowerCase().replace(/\s+/g, "_")).toLowerCase();
    const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0.9;
    const bbox = Array.isArray(parsed.bbox) && parsed.bbox.length === 4
      ? parsed.bbox as [number, number, number, number]
      : [
          Math.max(0, clickX - 0.15),
          Math.max(0, clickY - 0.15),
          Math.min(1, clickX + 0.15),
          Math.min(1, clickY + 0.15),
        ] as [number, number, number, number];

    // Resolve knowledge from SpaceAtlas DB → Wikipedia
    const knowledge = await resolveKnowledge(canonicalClass, objectName);

    return NextResponse.json({
      identified: true,
      noObject: false,
      tier: "tier2",
      tierLabel: "Gemini Multimodal Vision AI",
      object: {
        displayName: objectName,
        className: canonicalClass,
        confidence,
        bbox,
        category: parsed.category || "celestial",
        observation: parsed.observation || `Identified ${objectName} at the clicked location.`,
      },
      knowledge,
      suggestedQuestions: parsed.suggestedQuestions || [
        `What is ${objectName}?`,
        `Tell me more about ${objectName}.`,
        `What are interesting facts about ${objectName}?`,
      ],
      clickPosition: { x: clickX, y: clickY },
    });
  } catch (error: unknown) {
    console.error("[IDENTIFY_ERROR]", error);
    return NextResponse.json(
      {
        identified: false,
        noObject: true,
        error: "Failed to identify object",
        message: "The identification engine encountered an error. Please try clicking on a different area.",
        details: (error as Error)?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
