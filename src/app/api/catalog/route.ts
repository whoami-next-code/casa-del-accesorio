import { NextResponse } from 'next/server';
import { publishedItems, readInventory } from '@/lib/inventory-store';

export async function GET() {
  const store = await readInventory();
  return NextResponse.json({
    items: publishedItems(store),
    whatsapp: store.whatsapp,
  });
}
