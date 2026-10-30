'use client';

import { useEffect, useState } from 'react';
import { carCover, type CarJob } from '@/lib/cars';
import { Product, ShopSettings, whatsappUrl } from '@/lib/product';
import { supabase } from '@/lib/supabase';

export default function CarResults({
  product,
  settings,
}: {
  product: Product;
  settings: ShopSettings;
}) {
  const [jobs, setJobs] = useState<CarJob[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState<CarJob | null>(null);

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      fetch('/api/cars', { cache: 'no-store' })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { items?: CarJob[] } | null) => {
          if (!alive) return;
          if (Array.isArray(data?.items)) setJobs(data.items);
        })
        .catch(() => undefined)
        .finally(() => {
          if (alive) setReady(true);
        });

    refresh();
    const channel = supabase
      ?.channel('car-results')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'car_jobs' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'catalog_items' }, refresh)
      .subscribe();

    return () => {
      alive = false;
      if (channel) supabase?.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <section id="resultados" className="border-t border-line">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-steel text-sm">Trabajos reales</p>
        <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight mt-2">Resultados</h2>
        <p className="muted mt-3 max-w-xl">
          Autos que ya salieron del taller. Entra a cada ficha para ver fotos y videos de las modificaciones.
        </p>

        {!ready ? (
          <p className="muted mt-12">Cargando trabajos…</p>
        ) : jobs.length === 0 ? (
          <div className="mt-12 rounded-[28px] border border-line bg-bay px-6 py-16 text-center">
            <p className="font-display text-2xl">Aún no hay autos publicados</p>
            <p className="muted text-sm mt-3 max-w-md mx-auto">
              Cuando subas el primer trabajo en administración, aparece aquí con sus fotos y videos.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {jobs.map((job) => {
              const cover = carCover(job);
              return (
                <button
                  key={job.id}
                  className="text-left rounded-3xl bg-bay border border-line overflow-hidden group"
                  onClick={() => setOpen(job)}
                >
                  <div className="aspect-[4/3] bg-stage relative">
                    {cover ? (
                      <img src={cover} alt={job.title || job.car} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="h-full grid place-items-center muted text-sm">Sin foto</div>
                    )}
                    {job.videos.length > 0 && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-plaza/80 border border-line px-3 py-1 text-xs">
                        {job.videos.length} video{job.videos.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-steel">
                      {[job.car, job.year].filter(Boolean).join(' · ') || 'Auto del taller'}
                    </p>
                    <h3 className="font-display text-2xl leading-none mt-2">{job.title || job.car || 'Trabajo'}</h3>
                    {job.mods.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.mods.slice(0, 3).map((mod) => (
                          <span key={mod} className="pill py-1 pointer-events-none">
                            {mod}
                          </span>
                        ))}
                        {job.mods.length > 3 && <span className="text-xs text-steel self-center">+{job.mods.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-plaza/80 backdrop-blur-md overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-20">
            <article className="rounded-[28px] bg-bay border border-line p-5 md:p-8">
              <div className="flex justify-between gap-4 items-start">
                <div>
                  <p className="text-xs text-steel">{[open.car, open.year].filter(Boolean).join(' · ')}</p>
                  <h3 className="font-display text-3xl md:text-5xl font-bold mt-2">{open.title || open.car}</h3>
                </div>
                <button className="pill" onClick={() => setOpen(null)}>
                  Cerrar
                </button>
              </div>
              {open.blurb && <p className="muted mt-4 max-w-2xl">{open.blurb}</p>}
              {open.mods.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {open.mods.map((mod) => (
                    <span key={mod} className="pill py-1.5 pointer-events-none">
                      {mod}
                    </span>
                  ))}
                </div>
              )}
              {open.photos.length > 0 && (
                <div className="mt-8 grid sm:grid-cols-2 gap-3">
                  {open.photos.map((src) => (
                    <img key={src} src={src} alt="" className="w-full aspect-[4/3] object-cover rounded-2xl border border-line" />
                  ))}
                </div>
              )}
              {open.videos.length > 0 && (
                <div className="mt-6 space-y-4">
                  {open.videos.map((src) => (
                    <video key={src} src={src} className="w-full rounded-2xl border border-line bg-plaza" controls playsInline preload="metadata" />
                  ))}
                </div>
              )}
              <a
                href={
                  whatsappUrl(
                    settings.whatsapp,
                    product,
                    `Hola, vi el trabajo ${open.title || open.car} en Resultados y quiero un trabajo parecido.`,
                  ) || '#compatibilidad'
                }
                target={settings.whatsapp ? '_blank' : undefined}
                rel={settings.whatsapp ? 'noreferrer' : undefined}
                className="redbtn inline-block mt-8"
              >
                Quiero un trabajo así
              </a>
            </article>
          </div>
        </div>
      )}
    </section>
  );
}
