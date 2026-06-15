import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('id');
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  try {
    let url: string;
    if (projectId) {
      url = `https://api.nasa.gov/techport/api/projects/${projectId}?api_key=${apiKey}`;
    } else {
      // Get the list of project IDs updated since last year
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      const dateStr = lastYear.toISOString().split('T')[0];
      url = `https://api.nasa.gov/techport/api/projects?updatedSince=${dateStr}&api_key=${apiKey}`;
    }

    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`NASA TechPort API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch NASA TechPort:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
