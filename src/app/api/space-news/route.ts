import { NextResponse } from 'next/server';

export const revalidate = 3600;

const FALLBACK_SPACE_IMAGES = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?q=80&w=1200&auto=format&fit=crop",
];

function getFallbackImage(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_SPACE_IMAGES[Math.abs(hash) % FALLBACK_SPACE_IMAGES.length];
}

interface ArticleRaw {
  id: number;
  title: string;
  url: string;
  image_url?: string | null;
  news_site?: string;
  summary?: string;
  published_at: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitNum = parseInt(searchParams.get('limit') || '15', 10);

  try {
    // Fetch a larger set to allow effective deduplication
    const res = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?limit=40`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      throw new Error(`Spaceflight News API error: ${res.statusText}`);
    }

    const data = await res.json();
    const rawResults: ArticleRaw[] = data.results || [];

    // Deduplicate by normalized title & ensure image_url is present
    const seenTitles = new Set<string>();
    const deduplicated = [];

    for (const item of rawResults) {
      // Normalize title (lowercase, remove non-alphanumeric)
      const normTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
      
      // Also check first 40 chars for slight headline variations of the same news event
      const titlePrefix = normTitle.slice(0, 40);

      if (seenTitles.has(normTitle) || seenTitles.has(titlePrefix)) {
        continue;
      }
      seenTitles.add(normTitle);
      seenTitles.add(titlePrefix);

      // Ensure every news article has a valid image_url
      const finalImageUrl = (item.image_url && item.image_url.trim().length > 0)
        ? item.image_url
        : getFallbackImage(item.title);

      deduplicated.push({
        ...item,
        image_url: finalImageUrl,
      });
    }

    return NextResponse.json({
      count: deduplicated.length,
      results: deduplicated.slice(0, limitNum),
    });
  } catch (error) {
    console.error('Failed to fetch Spaceflight News:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

