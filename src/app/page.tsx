'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HeroShowroom from '@/components/HeroShowroom';
import ProductDetail from '@/components/ProductDetail';
import CatalogGrid from '@/components/CatalogGrid';
import InstallProcess from '@/components/InstallProcess';
import CompatibilityForm from '@/components/CompatibilityForm';
import FaqList from '@/components/FaqList';
import SiteFooter from '@/components/SiteFooter';
import { Marquee } from '@/components/ui/marquee';
import { NumberTicker } from '@/components/ui/number-ticker';
import { DEMO_PRODUCT, DEFAULT_SETTINGS, Product, ShopSettings, whatsappUrl } from '@/lib/product';
import { fetchStore } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { GARAGE_PARTS } from '@/lib/garage';

export default function Home() {
  const [product, setProduct] = useState<Product>(DEMO_PRODUCT);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(true);

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      fetchStore()
        .then((data) => {
          if (!alive) return;
          setProduct(data.product);
          setSettings(data.settings);
          setDemo(data.demo);
          setError('');
        })
        .catch((err) => {
          if (alive) setError(err.message);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });

    refresh();
    fetch('/api/catalog')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { whatsapp?: string } | null) => {
        if (!alive || !data?.whatsapp) return;
        setSettings((current) => (current.whatsapp ? current : { whatsapp: data.whatsapp as string }));
      })
      .catch(() => undefined);

    const channel = supabase
      ?.channel('showroom-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_settings' }, refresh)
      .subscribe();

    return () => {
      alive = false;
      if (channel) supabase?.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <Header whatsapp={whatsappUrl(settings.whatsapp, product)} />
      {error && (
        <div role="alert" className="fixed top-20 inset-x-0 z-50 bg-red-100 text-cta p-3 text-center text-sm">
          {error}{' '}
          <button className="underline" onClick={() => location.reload()}>
            Reintentar
          </button>
        </div>
      )}
      {loading && <span className="sr-only">Cargando datos del producto</span>}
      <HeroShowroom product={product} settings={settings} />

      <div className="border-y border-line bg-white">
        <Marquee pauseOnHover className="[--duration:28s]">
          {GARAGE_PARTS.map((part) => (
            <a key={part.id} href="#inicio" className="font-display text-2xl px-6 whitespace-nowrap hover:text-cta">
              {part.name}
            </a>
          ))}
        </Marquee>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
        <div>
          <p className="text-steel text-sm">Pieza de vitrina</p>
          <p className="font-display text-5xl font-bold mt-2">
            S/ <NumberTicker value={Number(product.price)} />
          </p>
          <p className="muted text-sm mt-2">Precio demo del alerón. El final se confirma en taller.</p>
        </div>
        <div>
          <p className="text-steel text-sm">Cómo se cotiza</p>
          <p className="font-display text-2xl font-semibold mt-2 leading-tight">Año, versión y una foto del maletero.</p>
        </div>
        <div>
          <p className="text-steel text-sm">Siguiente paso</p>
          <a href="#compatibilidad" className="redbtn inline-block mt-3">
            Armar el mensaje
          </a>
        </div>
      </section>

      {demo && (
        <p className="text-steel text-xs text-center py-2 border-y border-line bg-white">
          Demo local. El catálogo se edita en /admin. Conecta Supabase si quieres persistencia remota.
        </p>
      )}
      <ProductDetail product={product} settings={settings} />
      <CatalogGrid product={product} settings={settings} />
      <InstallProcess />
      <CompatibilityForm product={product} settings={settings} />
      <FaqList />
      <SiteFooter product={product} settings={settings} />
    </>
  );
}
