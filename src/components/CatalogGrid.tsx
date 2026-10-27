'use client';

import { useEffect, useMemo, useState } from 'react';
import { Product, ShopSettings, whatsappUrl } from '@/lib/product';
import { CATALOG_CATEGORIES, garageToItem, type CatalogItem } from '@/lib/inventory';

export default function CatalogGrid({
  product,
  settings,
}: {
  product: Product;
  settings: ShopSettings;
}) {
  const [items, setItems] = useState<CatalogItem[]>(garageToItem);
  const [filter, setFilter] = useState('Todas');

  useEffect(() => {
    let alive = true;
    fetch('/api/catalog')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items?: CatalogItem[] } | null) => {
        if (alive && Array.isArray(data?.items) && data.items.length) setItems(data.items);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => {
    const present = new Set(items.map((item) => item.category));
    return ['Todas', ...CATALOG_CATEGORIES.filter((name) => present.has(name))];
  }, [items]);

  const visible = items.filter((item) => filter === 'Todas' || item.category === filter);

  return (
    <section id="catalogo" className="border-t border-line">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">Catálogo de piezas</h2>
        <p className="muted mt-3 max-w-xl">
          Las ocho del auto de muestra y las que se agreguen en administración. El precio se confirma en taller.
        </p>
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Categorías">
          {categories.map((name) => (
            <button key={name} className="pill" data-active={filter === name} onClick={() => setFilter(name)}>
              {name}
            </button>
          ))}
        </div>
        <div className="mt-10 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visible.map((item) => {
            const link = whatsappUrl(
              settings.whatsapp,
              product,
              `Hola, vi el catálogo y quiero cotizar ${item.name} (${item.sku}).`,
            );
            return (
              <article key={item.id} className="rounded-3xl bg-bay border border-line overflow-hidden">
                <div className="aspect-[4/3] bg-stage">
                  {item.photo ? (
                    <img src={item.photo} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full grid place-items-center muted text-sm">Sin foto</div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-steel">
                    {item.sku} · {item.category}
                  </p>
                  <h3 className="font-display text-2xl leading-none mt-2">{item.name}</h3>
                  <p className="text-sm muted mt-3 line-clamp-3">{item.blurb}</p>
                  <div className="flex items-center justify-between gap-4 mt-5">
                    <p className="font-display text-xl">Desde S/ {item.price}</p>
                    <a
                      href={link || '#compatibilidad'}
                      target={link ? '_blank' : undefined}
                      rel={link ? 'noreferrer' : undefined}
                      className="pill py-2"
                    >
                      Cotizar
                    </a>
                  </div>
                  {!item.available && <p className="text-xs text-cta mt-3">Sin stock en demo</p>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
