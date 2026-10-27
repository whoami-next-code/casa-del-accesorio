import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { defaultInventory, type CatalogItem, type InventoryStore } from './inventory';

export type { CatalogItem, InventoryStore };

const dataDir = path.join(process.cwd(), 'data');
const filePath = path.join(dataDir, 'inventory.json');

function normalize(raw: Partial<InventoryStore> | null): InventoryStore {
  const fallback = defaultInventory();
  const items = Array.isArray(raw?.items) ? raw.items : fallback.items;
  return {
    whatsapp: typeof raw?.whatsapp === 'string' ? raw.whatsapp : '',
    items: items.map((item) => ({
      id: String(item.id || crypto.randomUUID()),
      sku: String(item.sku || ''),
      name: String(item.name || ''),
      category: String(item.category || 'Otros'),
      blurb: String(item.blurb || ''),
      specs: Array.isArray(item.specs) ? item.specs.map(String) : [],
      price: Number(item.price) || 0,
      photo: String(item.photo || ''),
      images: Array.isArray(item.images) ? item.images.map(String) : [],
      published: item.published !== false,
      available: item.available !== false,
      hotspot: item.hotspot,
    })),
  };
}

export async function readInventory(): Promise<InventoryStore> {
  try {
    const raw = JSON.parse(await readFile(filePath, 'utf8')) as Partial<InventoryStore>;
    return normalize(raw);
  } catch {
    const seed = defaultInventory();
    await writeInventory(seed);
    return seed;
  }
}

export async function writeInventory(store: InventoryStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, `${JSON.stringify(normalize(store), null, 2)}\n`, 'utf8');
}

export async function upsertItem(item: CatalogItem) {
  const store = await readInventory();
  const index = store.items.findIndex((entry) => entry.id === item.id);
  if (index >= 0) store.items[index] = item;
  else store.items.push(item);
  await writeInventory(store);
  return store;
}

export async function removeItem(id: string) {
  const store = await readInventory();
  store.items = store.items.filter((item) => item.id !== id);
  await writeInventory(store);
  return store;
}

export function publishedItems(store: InventoryStore) {
  return store.items.filter((item) => item.published);
}
