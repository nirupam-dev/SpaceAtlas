import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'patent';
  const query = searchParams.get('query') || '';
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  try {
    // NASA TechTransfer API endpoints
    const endpoints: Record<string, string> = {
      patent: `https://api.nasa.gov/techtransfer/patent/?engine&api_key=${apiKey}`,
      software: `https://api.nasa.gov/techtransfer/software/?engine&api_key=${apiKey}`,
      spinoff: `https://api.nasa.gov/techtransfer/spinoff/?engine&api_key=${apiKey}`,
    };

    let url = endpoints[category] || endpoints.patent;
    if (query) {
      url = `https://api.nasa.gov/techtransfer/${category}/?${query}&api_key=${apiKey}`;
    }

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`NASA TechTransfer API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch NASA TechTransfer:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
