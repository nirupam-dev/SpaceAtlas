import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache for 5 min

export async function GET() {
  try {
    const res = await fetch('http://api.open-notify.org/astros.json', {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Open Notify API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch people in space:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
