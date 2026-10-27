'use client';

import { Product, ShopSettings, whatsappUrl } from '@/lib/product';
import { GARAGE_PARTS, GaragePartId, partById } from '@/lib/garage';
import { NumberTicker } from '@/components/ui/number-ticker';
import { ShineBorder } from '@/components/ui/shine-border';

export default function PriceTag({
  product,
  settings,
  selected,
  variants,
  onClose,
  onVariant,
}: {
  product: Product;
  settings: ShopSettings;
  selected: GaragePartId;
  variants: Record<GaragePartId, number>;
  onClose: () => void;
  onVariant: (id: GaragePartId, index: number) => void;
}) {
  const part = partById(selected);
  const variant = part.variants[variants[part.id]];
  const consult = whatsappUrl(
    settings.whatsapp,
    product,
    `Hola, vi la plaza 3D y quiero cotizar ${part.name} (${variant.name}), código ${part.sku}.`,
  );

  return (
    <aside
      className="relative w-full max-w-sm rounded-3xl bg-bay p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
      aria-label={`Ficha de ${part.name}`}
    >
      <ShineBorder shineColor={['#007BFF', '#F10600', '#007BFF']} borderWidth={2} duration={12} />
      <div className="relative">
        <div className="flex justify-between items-start gap-4">
          <p className="text-sm text-steel">{part.tag}</p>
          <button onClick={onClose} aria-label="Cerrar ficha" className="text-xl leading-none w-10 h-10">
            ×
          </button>
        </div>
        <h2 className="font-display text-3xl font-bold leading-none mt-1">{part.name}</h2>
        <p className="font-display text-4xl font-bold mt-3">
          S/{' '}
          <NumberTicker key={`${part.id}-${variant.name}`} value={variant.price} />
        </p>
        <img src={part.photo} alt="" className="mt-3 h-28 w-full object-cover rounded-2xl border border-line" />
        <p className="text-sm leading-relaxed mt-3">{part.blurb}</p>
        <ul className="mt-3 space-y-1 text-xs text-steel">
          {part.specs.map((spec) => (
            <li key={spec}>· {spec}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 mt-4">
          {part.variants.map((item, index) => (
            <button
              key={item.name}
              className="pill py-1.5"
              data-active={variants[part.id] === index}
              onClick={() => onVariant(part.id, index)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-5">
          {consult ? (
            <a className="redbtn text-center" href={consult} target="_blank" rel="noreferrer">
              Cotizar esta pieza
            </a>
          ) : (
            <p className="text-sm text-cta">WhatsApp aún no configurado.</p>
          )}
          <a className="text-sm underline underline-offset-4" href="#producto" onClick={onClose}>
            Ver la ficha completa
          </a>
        </div>
        <p className="sr-only">{GARAGE_PARTS.length} piezas en el mostrador</p>
      </div>
    </aside>
  );
}
