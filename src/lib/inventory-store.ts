import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { BRAND } from './brand';
import { CARS_META_ID } from './cars';
import { defaultInventory, type CatalogItem, type InventoryStore } from './inventory';
import { itemToRow, rowToItem } from './catalog-map';
import { supabaseAdmin, supabaseReader } from './supabase-admin';

export type { CatalogItem, InventoryStore };

const dataDir = path.join(process.cwd(), 'data');
const filePath = path.join(dataDir, 'inventory.json');
const ephemeral = Boolean(process.env.VERCEL);

function normalize(raw: Partial<InventoryStore> | null): InventoryStore {
  const fallback = defaultInventory();
  const items = Array.isArray(raw?.items) ? raw.items : fallback.items;
  return {
    whatsapp: typeof raw?.whatsapp === 'string' && raw.whatsapp.replace(/\D/g, '') ? raw.whatsapp.replace(/\D/g, '') : BRAND.whatsapp,
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

async function readFileStore(): Promise<InventoryStore> {
  try {
    const raw = JSON.parse(await readFile(filePath, 'utf8')) as Partial<InventoryStore>;
    return normalize(raw);
  } catch {
    return defaultInventory();
  }
}

async function writeFileStore(store: InventoryStore) {
  if (ephemeral) {
    throw new Error('En Vercel el catálogo se guarda en Supabase. Falta SUPABASE_SERVICE_ROLE_KEY.');
  }
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, `${JSON.stringify(normalize(store), null, 2)}\n`, 'utf8');
}

async function readSupabaseStore(): Promise<InventoryStore | null> {
  const db = supabaseReader();
  if (!db) return null;

  const [itemsRes, settingsRes] = await Promise.all([
    db.from('catalog_items').select('*').order('sort_order', { ascending: true }),
    db.from('shop_settings').select('whatsapp').eq('id', 1).maybeSingle(),
  ]);

  if (itemsRes.error) throw new Error(`No se pudo leer el catálogo: ${itemsRes.error.message}`);
  if (settingsRes.error) throw new Error(`No se pudo leer WhatsApp: ${settingsRes.error.message}`);

  const items = (itemsRes.data ?? []).map(rowToItem).filter((item) => item.id !== CARS_META_ID);
  return {
    whatsapp: settingsRes.data?.whatsapp?.replace(/\D/g, '') || BRAND.whatsapp,
    items,
  };
}

async function seedSupabase(store: InventoryStore) {
  const db = supabaseAdmin();
  if (!db) return store;
  await writeSupabaseStore(store);
  return store;
}

async function writeSupabaseStore(store: InventoryStore) {
  const db = supabaseAdmin();
  if (!db) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para guardar el catálogo.');
  }

  const normalized = normalize(store);
  const rows = normalized.items.map((item, index) => itemToRow(item, index));

  const settings = await db.from('shop_settings').upsert({ id: 1, whatsapp: normalized.whatsapp });
  if (settings.error) throw new Error(`No se pudo guardar WhatsApp: ${settings.error.message}`);

  if (rows.length) {
    const upserted = await db.from('catalog_items').upsert(rows);
    if (upserted.error) throw new Error(`No se pudo guardar el catálogo: ${upserted.error.message}`);
  }

  const existing = await db.from('catalog_items').select('id');
  if (existing.error) throw new Error(`No se pudo sincronizar el catálogo: ${existing.error.message}`);

  const keep = new Set(normalized.items.map((item) => item.id));
  keep.add(CARS_META_ID);
  const remove = (existing.data ?? []).map((row) => row.id).filter((id) => !keep.has(id));
  if (remove.length) {
    const deleted = await db.from('catalog_items').delete().in('id', remove);
    if (deleted.error) throw new Error(`No se pudieron quitar piezas: ${deleted.error.message}`);
  }

  const featured = normalized.items.find((item) => item.sku === 'LCDA-ALE-001') ?? normalized.items[0];
  if (featured) {
    const product = await db.from('products').upsert(
      {
        sku: featured.sku,
        name: featured.name || 'Pieza de vitrina',
        category: featured.category,
        description: featured.blurb,
        price: featured.price,
        available: featured.available,
        published: featured.published,
        features: featured.specs,
        images: featured.images.length ? featured.images : featured.photo ? [featured.photo] : [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'sku' },
    );
    if (product.error) throw new Error(`No se pudo actualizar la pieza de vitrina: ${product.error.message}`);
  }

  return normalized;
}

export async function readInventory(): Promise<InventoryStore> {
  const remote = await readSupabaseStore();
  if (remote) {
    if (remote.items.length) return remote;
    const seed = { ...defaultInventory(), whatsapp: remote.whatsapp };
    if (supabaseAdmin()) return seedSupabase(seed);
    return seed;
  }
  const local = await readFileStore();
  if (!ephemeral && !(await fileExists())) await writeFileStore(local);
  return local;
}

async function fileExists() {
  try {
    await readFile(filePath, 'utf8');
    return true;
  } catch {
    return false;
  }
}

export async function writeInventory(store: InventoryStore) {
  if (supabaseAdmin()) return writeSupabaseStore(store);
  await writeFileStore(store);
  return normalize(store);
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
  return store.items.filter((item) => item.published && item.id !== CARS_META_ID);
}

export function persistenceMode() {
  if (supabaseAdmin()) return 'supabase-admin' as const;
  if (supabaseReader()) return 'supabase-read' as const;
  if (ephemeral) return 'ephemeral' as const;
  return 'local' as const;
}
