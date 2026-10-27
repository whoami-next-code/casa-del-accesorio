'use client';

import { useEffect, useState } from 'react';
import { Product, ShopSettings } from '@/lib/product';
import { CAMERA_VIEWS, CameraView } from '@/lib/catalog';
import { GARAGE_PAINTS, GARAGE_PARTS, GaragePartId } from '@/lib/garage';
import { VIEW_TO_FRAME } from '@/lib/photos';
import PhotoStage from './PhotoStage';
import PhotoTurntable from './PhotoTurntable';
import PriceTag from './PriceTag';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { BorderBeam } from '@/components/ui/border-beam';

const defaultVariants = Object.fromEntries(GARAGE_PARTS.map((part) => [part.id, 0])) as Record<GaragePartId, number>;

export default function HeroShowroom({
  product,
  settings,
}: {
  product: Product;
  settings: ShopSettings;
}) {
  const [mode, setMode] = useState<'fotos' | 'modelo'>('fotos');
  const [selected, setSelected] = useState<GaragePartId | null>(null);
  const [variants, setVariants] = useState(defaultVariants);
  const [spinning, setSpinning] = useState(false);
  const [paint, setPaint] = useState(GARAGE_PAINTS[2]);
  const [view, setView] = useState<CameraView>('orbit');
  const [frame, setFrame] = useState(VIEW_TO_FRAME.orbit);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setSpinning(false);
  }, []);

  const pick = (id: GaragePartId) => {
    if (!product.published) return;
    setSpinning(false);
    setSelected(id);
    if (id === 'spoiler') setView('spoiler');
  };

  const back = () => {
    setSelected(null);
    setView('orbit');
    setFrame(VIEW_TO_FRAME.orbit);
  };

  return (
    <section id="inicio" className="relative min-h-[760px] h-[100svh] max-h-[1100px] overflow-hidden bg-plaza pt-16">
      <AnimatedGridPattern
        numSquares={28}
        maxOpacity={0.18}
        duration={3}
        className="text-ink/20 motion-reduce:hidden [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"
      />
      <div className="absolute inset-x-4 md:inset-x-8 top-20 bottom-28 md:bottom-24 rounded-[28px] overflow-hidden bg-stage">
        <div className="motion-reduce:hidden">
          <BorderBeam size={90} duration={8} colorFrom="#E8A317" colorTo="#DC2626" borderWidth={2} />
        </div>
        <div className="absolute inset-[3px] rounded-[26px] overflow-hidden">
          {mode === 'fotos' ? (
            <PhotoStage view={view} selected={selected} published={product.published} onPick={pick} />
          ) : (
            <PhotoTurntable
              frame={frame}
              spinning={spinning && !selected}
              paintHex={paint.hex}
              published={product.published}
              selected={selected}
              onPick={pick}
              onInteract={() => setSpinning(false)}
            />
          )}
        </div>

        {!selected && (
          <div className="absolute left-5 top-5 z-10 max-w-[17rem] md:max-w-[22rem] pointer-events-none">
            <div className="rounded-2xl bg-white/92 px-4 py-3 border border-line shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
              <h1 className="font-display font-bold text-ink text-[26px] md:text-[38px] leading-[1.05]">
                {mode === 'fotos' ? 'Míralo en foto.' : 'Gíralo 360°.'}
              </h1>
              <p className="muted mt-2 text-sm pointer-events-auto">
                {mode === 'fotos'
                  ? 'Toca un punto: cada uno es un equipo del kit.'
                  : 'Arrastra o desliza. El auto sigue el gesto.'}
              </p>
            </div>
          </div>
        )}
        {selected && product.published && (
          <div className="absolute z-20 right-4 top-4 left-4 md:left-auto">
            <PriceTag
              product={product}
              settings={settings}
              selected={selected}
              variants={variants}
              onClose={back}
              onVariant={(id, index) => setVariants((prev) => ({ ...prev, [id]: index }))}
            />
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 md:px-8 pb-4">
        <div className="glass rounded-2xl px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-1" role="group" aria-label="Modo de vitrina">
            <button className="pill" data-active={mode === 'fotos'} onClick={() => setMode('fotos')}>
              Fotos
            </button>
            <button
              className="pill"
              data-active={mode === 'modelo'}
              onClick={() => {
                setMode('modelo');
                setSpinning(false);
              }}
            >
              360°
            </button>
          </div>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Ángulos">
            {CAMERA_VIEWS.map((item) => (
              <button
                key={item.id}
                className="pill"
                data-active={view === item.id && !selected}
                onClick={() => {
                  setView(item.id);
                  setFrame(VIEW_TO_FRAME[item.id]);
                  setSpinning(false);
                  if (item.id !== 'spoiler') setSelected(null);
                  else setSelected('spoiler');
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          {mode === 'modelo' && (
            <div className="flex items-center gap-2" role="group" aria-label="Color de carrocería">
              {GARAGE_PAINTS.map((option) => (
                <button
                  key={option.id}
                  className="pit-dot"
                  style={{ background: option.hex }}
                  data-active={paint.id === option.id}
                  aria-label={option.name}
                  title={option.name}
                  onClick={() => setPaint(option)}
                />
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 lg:ml-auto">
            <button className="redbtn py-2.5" onClick={() => pick('spoiler')} disabled={!product.published}>
              Ver alerón
            </button>
            <button className="pill" onClick={() => setSpinning((v) => !v)} disabled={Boolean(selected)}>
              {spinning ? 'Pausar' : 'Girar'}
            </button>
            <button className="pill" onClick={back}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
