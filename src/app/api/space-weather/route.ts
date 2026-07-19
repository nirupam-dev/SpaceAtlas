import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'CME'; // CME, GST, FLR, SEP, MPC
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  // Last 30 days
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    const url = `https://api.nasa.gov/DONKI/${type}?startDate=${startDate}&endDate=${endDate}&api_key=${apiKey}`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      // DONKI sometimes returns 404 or other errors for certain event types when no data exists
      return NextResponse.json([]);
    }

    const text = await res.text();
    if (!text || text.trim() === '') {
      return NextResponse.json([]);
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      // Non-JSON response (sometimes DONKI returns HTML errors)
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Failed to fetch space weather:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array instead of error
  }
}
