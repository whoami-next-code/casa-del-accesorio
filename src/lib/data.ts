import { BRAND } from './brand';
import { itemToProduct, rowToItem } from './catalog-map';
import { DEMO_PRODUCT, DEFAULT_SETTINGS, type Product, type ShopSettings } from './product';
import { supabase } from './supabase';

export async function fetchStore(): Promise<{ product: Product; settings: ShopSettings; demo: boolean }> {
  if (!supabase) return { product: DEMO_PRODUCT, settings: DEFAULT_SETTINGS, demo: true };

  const [catalog, legacy, settings] = await Promise.all([
    supabase.from('catalog_items').select('*').eq('sku', 'LCDA-ALE-001').maybeSingle(),
    supabase.from('products').select('*').eq('sku', 'LCDA-ALE-001').maybeSingle(),
    supabase.from('shop_settings').select('*').eq('id', 1).maybeSingle(),
  ]);

  if (catalog.error && legacy.error) {
    throw new Error(`No se pudo cargar el producto: ${catalog.error.message}`);
  }
  if (settings.error) throw new Error(`No se pudo cargar la configuración: ${settings.error.message}`);

  const product = catalog.data
    ? itemToProduct(rowToItem(catalog.data))
    : legacy.data
      ? { ...legacy.data, price: Number(legacy.data.price) }
      : DEMO_PRODUCT;

  return {
    product,
    settings: { whatsapp: settings.data?.whatsapp || BRAND.whatsapp },
    demo: false,
  };
}
