import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '15';

  try {
    const res = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?limit=${limit}`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      throw new Error(`Spaceflight News API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch Spaceflight News:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
