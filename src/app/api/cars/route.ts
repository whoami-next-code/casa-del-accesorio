import { NextResponse } from 'next/server';
import { publishedCars, readCars } from '@/lib/cars-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = publishedCars(await readCars());
    return NextResponse.json(
      { items },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo leer el catálogo de autos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
