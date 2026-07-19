import { NextResponse } from 'next/server';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  try {
    // NASA CNEOS Fireball API - last 12 months
    const minDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const url = `https://ssd-api.jpl.nasa.gov/fireball.api?date-min=${minDate}&req-loc=true`;

    const res = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error(`NASA Fireball API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch fireball data:', error);
    return NextResponse.json({ error: 'Failed to fetch fireball data' }, { status: 500 });
  }
}
