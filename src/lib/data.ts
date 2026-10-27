import {supabase} from './supabase';
import {DEMO_PRODUCT,DEFAULT_SETTINGS,Product,ShopSettings} from './product';
export async function fetchStore():Promise<{product:Product;settings:ShopSettings;demo:boolean}>{
 if(!supabase)return {product:DEMO_PRODUCT,settings:DEFAULT_SETTINGS,demo:true};
 const [p,s]=await Promise.all([supabase.from('products').select('*').eq('sku','LCDA-ALE-001').single(),supabase.from('shop_settings').select('*').eq('id',1).single()]);
 if(p.error)throw new Error(`No se pudo cargar el producto: ${p.error.message}`);
 if(s.error)throw new Error(`No se pudo cargar la configuración: ${s.error.message}`);
 return {product:{...p.data,price:Number(p.data.price)},settings:{whatsapp:s.data.whatsapp??''},demo:false};
}
