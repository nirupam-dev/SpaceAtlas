import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rover = searchParams.get('rover') || 'curiosity';
  const sol = searchParams.get('sol') || '1000';
  const camera = searchParams.get('camera') || '';
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  try {
    let url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${apiKey}`;
    if (camera) {
      url += `&camera=${camera}`;
    }
    // Limit results
    url += '&page=1';

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`NASA Mars Rover API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch Mars Rover photos:', error);
    return NextResponse.json({ error: 'Failed to fetch Mars photos' }, { status: 500 });
  }
}
