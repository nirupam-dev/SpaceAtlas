import { NextResponse } from 'next/server';

export const revalidate = 86400; // Cache for 24 hours

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '50';

  try {
    // NASA Exoplanet Archive TAP API
    const query = encodeURIComponent(
      `SELECT TOP ${limit} pl_name,hostname,sy_snum,sy_pnum,disc_year,discoverymethod,pl_orbper,pl_rade,pl_bmasse,pl_eqt,st_spectype,sy_dist FROM ps WHERE default_flag=1 ORDER BY disc_year DESC`
    );
    const url = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${query}&format=json`;

    const res = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error(`Exoplanet Archive API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch exoplanet data:', error);
    return NextResponse.json({ error: 'Failed to fetch exoplanet data' }, { status: 500 });
  }
}
