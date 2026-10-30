'use client';

import { useEffect, useMemo, useState } from 'react';
import { Product, ShopSettings, whatsappUrl } from '@/lib/product';
import { CATALOG_CATEGORIES, garageToItem, type CatalogItem } from '@/lib/inventory';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 6;

function pageNumbers(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const wanted = new Set([1, total, current - 1, current, current + 1]);
  return [...wanted].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
}

export default function CatalogGrid({
  product,
  settings,
}: {
  product: Product;
  settings: ShopSettings;
}) {
  const [items, setItems] = useState<CatalogItem[]>(garageToItem);
  const [filter, setFilter] = useState('Todas');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      fetch('/api/catalog')
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { items?: CatalogItem[] } | null) => {
          if (alive && Array.isArray(data?.items) && data.items.length) setItems(data.items);
        })
        .catch(() => undefined);

    refresh();
    const channel = supabase
      ?.channel('catalog-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'catalog_items' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_settings' }, refresh)
      .subscribe();

    return () => {
      alive = false;
      if (channel) supabase?.removeChannel(channel);
    };
  }, []);

  const categories = useMemo(() => {
    const present = new Set(items.map((item) => item.category));
    return ['Todas', ...CATALOG_CATEGORIES.filter((name) => present.has(name))];
  }, [items]);

  const filtered = items.filter((item) => filter === 'Todas' || item.category === filter);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const from = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length);
  const pages = pageNumbers(currentPage, pageCount);

  function goTo(next: number) {
    setPage(next);
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section id="catalogo" className="border-t border-line">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">Catálogo de piezas</h2>
            <p className="muted mt-3 max-w-xl">
              Seis por página. Filtra por tipo y cotiza la que te sirve; el precio se confirma en taller.
            </p>
          </div>
          <p className="text-sm text-steel" aria-live="polite">
            {filtered.length ? `${from}–${to} de ${filtered.length}` : 'Sin piezas en este filtro'}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Categorías">
          {categories.map((name) => (
            <button
              key={name}
              className="pill"
              data-active={filter === name}
              aria-pressed={filter === name}
              onClick={() => {
                setFilter(name);
                setPage(1);
              }}
            >
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
        {pageCount > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-between gap-3" aria-label="Páginas del catálogo">
            <button className="pill" disabled={currentPage === 1} onClick={() => goTo(currentPage - 1)}>
              Anterior
            </button>
            <div className="flex flex-wrap justify-center gap-2">
              {pages.map((number, index) => {
                const previous = pages[index - 1];
                return (
                  <span key={number} className="contents">
                    {previous && number - previous > 1 && (
                      <span className="muted px-1 self-center" aria-hidden>
                        …
                      </span>
                    )}
                    <button
                      className="pill min-w-10"
                      data-active={number === currentPage}
                      aria-current={number === currentPage ? 'page' : undefined}
                      onClick={() => goTo(number)}
                    >
                      {number}
                    </button>
                  </span>
                );
              })}
            </div>
            <button className="pill" disabled={currentPage === pageCount} onClick={() => goTo(currentPage + 1)}>
              Siguiente
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
