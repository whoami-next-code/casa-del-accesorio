import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { normalizeCar, type CarJob } from '@/lib/cars';
import { readCars, writeCars } from '@/lib/cars-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    return NextResponse.json({ items: await readCars() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudieron leer los autos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { items?: CarJob[] } | null;
  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  try {
    const items = await writeCars(body.items.map(normalizeCar));
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudieron guardar los autos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
