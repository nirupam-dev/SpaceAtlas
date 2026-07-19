import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '20';
  const status = searchParams.get('status') || 'open'; // open or closed
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  try {
    const url = `https://eonet.gsfc.nasa.gov/api/v3/events?limit=${limit}&status=${status}&api_key=${apiKey}`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`NASA EONET API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch EONET events:', error);
    return NextResponse.json({ error: 'Failed to fetch natural events' }, { status: 500 });
  }
}
