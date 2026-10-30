import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { persistenceMode, readInventory, writeInventory, type InventoryStore } from '@/lib/inventory-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const store = await readInventory();
    return NextResponse.json({ ...store, persistence: persistenceMode() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo leer el catálogo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as InventoryStore | null;
  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  try {
    const store = await writeInventory(body);
    return NextResponse.json({ ...store, persistence: persistenceMode() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo guardar';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
