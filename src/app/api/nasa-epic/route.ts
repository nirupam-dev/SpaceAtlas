import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || '';
  const collection = searchParams.get('collection') || 'natural'; // natural or enhanced
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  try {
    let url: string;
    if (date) {
      url = `https://api.nasa.gov/EPIC/api/${collection}/date/${date}?api_key=${apiKey}`;
    } else {
      // Get most recent images
      url = `https://api.nasa.gov/EPIC/api/${collection}?api_key=${apiKey}`;
    }

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`NASA EPIC API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch NASA EPIC:', error);
    return NextResponse.json({ error: 'Failed to fetch Earth imagery' }, { status: 500 });
  }
}
