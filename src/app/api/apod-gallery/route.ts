import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  try {
    // Fetch multiple APOD entries (last 15 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`NASA APOD Gallery API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch APOD gallery:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}
