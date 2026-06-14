import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  
  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      throw new Error(`NASA API error: ${res.statusText}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch APOD:', error);
    return NextResponse.json({ error: 'Failed to fetch APOD' }, { status: 500 });
  }
}
