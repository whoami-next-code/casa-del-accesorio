'use client';

import { useState } from 'react';
import { Product, ShopSettings, whatsappUrl } from '@/lib/product';
import SpoilerMark from './SpoilerMark';
import { ShineBorder } from '@/components/ui/shine-border';

export default function ProductDetail({
  product,
  settings,
}: {
  product: Product;
  settings: ShopSettings;
}) {
  const [active, setActive] = useState(0);
  if (!product.published) {
    return (
      <section id="producto" className="py-24 text-center muted">
        Producto temporalmente oculto.
      </section>
    );
  }

  const link = whatsappUrl(settings.whatsapp, product);
  const shots = product.images;

  return (
    <section id="producto" className="px-4 md:px-8 py-16 md:py-24">
      <div className="relative max-w-6xl mx-auto rounded-[28px] bg-bay p-6 md:p-12 overflow-hidden">
        <ShineBorder shineColor={['#007BFF', '#F10600']} borderWidth={1} duration={16} />
        <div className="relative grid md:grid-cols-2 gap-10">
          <div>
            <div className="bg-stage min-h-64 aspect-[4/3] flex items-center justify-center overflow-hidden rounded-2xl">
              {shots[active] ? (
                <img src={shots[active]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <SpoilerMark />
              )}
            </div>
            {shots.length > 1 && (
              <div className="flex gap-2 mt-3">
                {shots.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActive(i)}
                    className={`h-14 w-16 overflow-hidden rounded-lg border ${i === active ? 'border-sun' : 'border-line'}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-steel text-sm">{product.sku}</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[0.95] mt-2">{product.name}</h2>
            <p className="muted text-sm mt-3">{product.category}</p>
            <p className="leading-relaxed mt-5">{product.description}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {product.features.map((item) => (
                <li key={item} className="border-b border-line pb-2">
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex items-end gap-4">
              <span className="font-display text-4xl font-bold">S/ {Number(product.price).toFixed(2)}</span>
              <span className="text-xs muted pb-1">
                {product.available ? 'Pieza demo, sujeta a stock' : 'Sin stock en demo'}
              </span>
            </div>
            <p className="text-xs muted mt-3">
              No es una oferta cerrada. Precio final, pernos y pintura se confirman con tu auto.
            </p>
            {link ? (
              <a href={link} target="_blank" rel="noreferrer" className="redbtn inline-block mt-6">
                Cotizar esta pieza
              </a>
            ) : (
              <p className="text-sm text-cta mt-6">WhatsApp todavía no configurado.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
