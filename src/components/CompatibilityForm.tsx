'use client';

import { FormEvent, useState } from 'react';
import { Product, ShopSettings, compatibilityMessage, whatsappUrl } from '@/lib/product';
import { COROLLA_TRIMS, COROLLA_YEARS } from '@/lib/catalog';

export default function CompatibilityForm({
  product,
  settings,
}: {
  product: Product;
  settings: ShopSettings;
}) {
  const [year, setYear] = useState(COROLLA_YEARS[2]);
  const [trim, setTrim] = useState(COROLLA_TRIMS[0]);
  const extra = compatibilityMessage(product, year, trim);
  const link = whatsappUrl(settings.whatsapp, product, extra);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  }

  return (
    <section id="compatibilidad" className="px-4 md:px-8 py-16 md:py-24 bg-bay border-y border-line">
      <form onSubmit={onSubmit} className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">Año y versión, y el mensaje queda listo</h2>
          <p className="muted mt-4 max-w-md">
            E170 y E210 no comparten maletero. Esto no aprueba la pieza: abre WhatsApp con los datos.
          </p>
        </div>
        <div className="space-y-5">
          <label className="block text-sm">
            Año o generación
            <select className="field mt-2" value={year} onChange={(e) => setYear(e.target.value)}>
              {COROLLA_YEARS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Versión
            <select className="field mt-2" value={trim} onChange={(e) => setTrim(e.target.value)}>
              {COROLLA_TRIMS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <p className="text-xs leading-relaxed border border-line rounded-xl p-3">{extra}</p>
          {link ? (
            <button type="submit" className="redbtn w-full">
              Abrir cotización en WhatsApp
            </button>
          ) : (
            <p className="text-sm text-cta">Falta el número comercial. Configúralo en administración o escríbenos por TikTok.</p>
          )}
        </div>
      </form>
    </section>
  );
}
