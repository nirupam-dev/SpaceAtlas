import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface NasaImage {
  url: string;
  title: string;
  description: string;
}

async function fetchNasaImages(query: string): Promise<NasaImage[]> {
  try {
    // Extract a clean 1-2 word keyword for the image search
    const keyword = query
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter((w) => !["what", "is", "are", "the", "a", "an", "tell", "me", "about", "how", "why", "when", "did", "does"].includes(w))
      .slice(0, 2)
      .join(" ")
      .trim() || query.split(" ").slice(0, 2).join(" ");

    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(keyword)}&media_type=image&page_size=6`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data = await res.json();
    const items: any[] = data?.collection?.items ?? [];

    const images: NasaImage[] = [];
    for (const item of items) {
      if (images.length >= 3) break;
      const links: any[] = item.links ?? [];
      const imgLink = links.find((l: any) => l.rel === "preview");
      const meta = item.data?.[0];
      if (imgLink?.href && meta?.title) {
        images.push({
          url: imgLink.href,
          title: meta.title,
          description: (meta.description ?? "").slice(0, 120),
        });
      }
    }
    return images;
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured in .env.local" }, { status: 500 });
  }

  try {
    const { message, history } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction:
        "You are ATLAS, the SpaceAtlas AI. You are a brilliant, highly advanced AI assistant specialized entirely in astronomy, space exploration, astrophysics, rockets, and astronauts. Your tone should be cinematic, slightly sci-fi, highly intelligent, and extremely helpful. If a user asks a question completely unrelated to space, gently guide them back to the cosmos. Format your responses with clear markdown.",
    });

    // Format history for Gemini API
    const formattedHistory = history
      ? history.map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }))
      : [];

    const chat = model.startChat({ history: formattedHistory });

    // Run Gemini and NASA image fetch in parallel
    const [result, images] = await Promise.all([
      chat.sendMessage(message),
      fetchNasaImages(message),
    ]);

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text, images });
  } catch (error: any) {
    console.error("Error with Gemini API:", error);
    return NextResponse.json({ error: error.message || "Failed to generate response." }, { status: 500 });
  }
}
