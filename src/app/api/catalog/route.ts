import { NextResponse } from 'next/server';
import { persistenceMode, publishedItems, readInventory } from '@/lib/inventory-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = await readInventory();
    return NextResponse.json({
      items: publishedItems(store),
      whatsapp: store.whatsapp,
      persistence: persistenceMode(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo leer el catálogo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
