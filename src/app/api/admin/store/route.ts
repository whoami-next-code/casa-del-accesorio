import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { readInventory, writeInventory, type InventoryStore } from '@/lib/inventory-store';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return NextResponse.json(await readInventory());
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as InventoryStore | null;
  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  await writeInventory(body);
  return NextResponse.json(await readInventory());
}
