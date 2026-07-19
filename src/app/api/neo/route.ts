import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];
  const endDate = searchParams.get('end_date') || startDate;
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  try {
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`NASA NEO API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch NEO data:', error);
    return NextResponse.json({ error: 'Failed to fetch asteroid data' }, { status: 500 });
  }
}
