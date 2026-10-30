import { BRAND } from './brand';
import { GARAGE_PARTS, type GaragePartId } from './garage';

export type CatalogItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  blurb: string;
  specs: string[];
  price: number;
  photo: string;
  images: string[];
  published: boolean;
  available: boolean;
  hotspot?: GaragePartId;
};

export type InventoryStore = {
  whatsapp: string;
  items: CatalogItem[];
};

export const CATALOG_CATEGORIES = ['Alerones', 'Iluminación', 'Rines', 'Body kit', 'Escape', 'Capós', 'Otros'];

export function garageToItem(): CatalogItem[] {
  return GARAGE_PARTS.map((part) => ({
    id: part.id,
    sku: part.sku,
    name: part.name,
    category: part.category,
    blurb: part.blurb,
    specs: part.specs,
    price: part.variants[0]?.price ?? 0,
    photo: part.photo,
    images: [part.photo],
    published: true,
    available: true,
    hotspot: part.id,
  }));
}

export function emptyItem(): CatalogItem {
  const stamp = Date.now().toString(36);
  return {
    id: `pieza-${stamp}`,
    sku: `LCDA-${stamp.slice(-6).toUpperCase()}`,
    name: '',
    category: 'Otros',
    blurb: '',
    specs: [],
    price: 0,
    photo: '',
    images: [],
    published: true,
    available: true,
  };
}

export function defaultInventory(): InventoryStore {
  return { whatsapp: BRAND.whatsapp, items: garageToItem() };
}
