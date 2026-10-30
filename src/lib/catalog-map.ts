import type { CatalogItem } from './inventory';
import { DEMO_PRODUCT, type Product } from './product';
import type { GaragePartId } from './garage';

type CatalogRow = {
  id: string;
  sku?: string | null;
  name?: string | null;
  category?: string | null;
  blurb?: string | null;
  specs?: string[] | null;
  price?: number | string | null;
  photo?: string | null;
  images?: string[] | null;
  published?: boolean | null;
  available?: boolean | null;
  hotspot?: string | null;
};

export function rowToItem(row: CatalogRow): CatalogItem {
  return {
    id: String(row.id),
    sku: String(row.sku || ''),
    name: String(row.name || ''),
    category: String(row.category || 'Otros'),
    blurb: String(row.blurb || ''),
    specs: Array.isArray(row.specs) ? row.specs.map(String) : [],
    price: Number(row.price) || 0,
    photo: String(row.photo || ''),
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    published: row.published !== false,
    available: row.available !== false,
    hotspot: (row.hotspot as GaragePartId | null) || undefined,
  };
}

export function itemToRow(item: CatalogItem, sortOrder: number) {
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    category: item.category,
    blurb: item.blurb,
    specs: item.specs,
    price: item.price,
    photo: item.photo,
    images: item.images,
    published: item.published,
    available: item.available,
    hotspot: item.hotspot ?? null,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };
}

export function itemToProduct(item: CatalogItem): Product {
  const extras = item.sku === DEMO_PRODUCT.sku ? DEMO_PRODUCT.images : [];
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    category: item.category,
    description: item.blurb,
    price: item.price,
    available: item.available,
    published: item.published,
    features: item.specs,
    images: [...new Set([...item.images, item.photo, ...extras].filter(Boolean))],
  };
}
