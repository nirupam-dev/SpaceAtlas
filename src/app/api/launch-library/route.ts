import { NextResponse } from 'next/server';

export const revalidate = 1800; // Cache for 30 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '10';
  const type = searchParams.get('type') || 'upcoming'; // upcoming or previous

  try {
    const url = `https://ll.thespacedevs.com/2.3.0/launches/${type}/?limit=${limit}&mode=detailed`;

    const res = await fetch(url, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      throw new Error(`Launch Library API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch launches:', error);
    return NextResponse.json({ error: 'Failed to fetch launch data' }, { status: 500 });
  }
}
