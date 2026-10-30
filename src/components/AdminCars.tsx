'use client';

import { useEffect, useRef, useState } from 'react';
import { emptyCar, type CarJob } from '@/lib/cars';
import { uploadMedia } from '@/lib/media-upload';

export default function AdminCars() {
  const [jobs, setJobs] = useState<CarJob[]>([]);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const jobsRef = useRef<CarJob[]>([]);
  jobsRef.current = jobs;

  const job = jobs.find((entry) => entry.id === selected) ?? jobs[0];

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const response = await fetch('/api/admin/cars');
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(error?.error || 'No se pudieron cargar los autos');
      return;
    }
    const data = (await response.json()) as { items?: CarJob[] };
    const items = Array.isArray(data.items) ? data.items : [];
    setJobs(items);
    setSelected((current) => items.find((entry) => entry.id === current)?.id ?? items[0]?.id ?? '');
  }

  function patch(partial: Partial<CarJob>) {
    if (!job) return;
    setJobs((current) => current.map((entry) => (entry.id === job.id ? { ...entry, ...partial } : entry)));
  }

  async function persist(next: CarJob[], okMessage = 'Resultados guardados.') {
    setJobs(next);
    const response = await fetch('/api/admin/cars', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: next }),
    });
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(error?.error || 'No se pudo guardar');
    }
    const data = (await response.json()) as { items?: CarJob[] };
    if (Array.isArray(data.items)) setJobs(data.items);
    setMessage(okMessage);
  }

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      await persist(jobs);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      setBusy(false);
    }
  }

  async function addFiles(files: FileList | null, kind: 'photo' | 'video' | 'cover') {
    if (!job || !files?.length) return;
    const currentId = job.id;
    const selected = Array.from(files);
    setBusy(true);
    setMessage(kind === 'video' ? 'Subiendo video…' : 'Subiendo foto…');
    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        const result = await uploadMedia(file, 'cars');
        uploaded.push(result.url);
      }
      const current = jobsRef.current;
      const base = current.some((entry) => entry.id === currentId) ? current : [...current, job];
      const next = base.map((entry) => {
        if (entry.id !== currentId) return entry;
        if (kind === 'cover') {
          return { ...entry, cover: uploaded[0], photos: [...new Set([uploaded[0], ...entry.photos])] };
        }
        if (kind === 'photo') {
          const photos = [...entry.photos, ...uploaded];
          return { ...entry, photos, cover: entry.cover || photos[0] };
        }
        return { ...entry, videos: [...entry.videos, ...uploaded] };
      });
      if (!next.length) {
        throw new Error('No hay una ficha de auto para guardar el archivo. Crea un auto y vuelve a subirlo.');
      }
      await persist(next, kind === 'video' ? 'Video publicado en Resultados.' : 'Foto publicada en Resultados.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo subir');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-6">
      <aside className="glass rounded-3xl p-4 h-fit">
        <p className="text-sm text-steel mb-3">Autos</p>
        <div className="space-y-1 max-h-[70vh] overflow-auto">
          {jobs.map((entry) => (
            <button
              key={entry.id}
              className="w-full text-left rounded-xl px-3 py-2 text-sm"
              data-active={entry.id === job?.id}
              style={{
                  background: entry.id === job?.id ? 'var(--sun)' : 'transparent',
                  color: entry.id === job?.id ? '#fff' : 'inherit',
              }}
              onClick={() => setSelected(entry.id)}
            >
              {entry.title || entry.car || 'Nuevo auto'}
              {!entry.published && <span className="opacity-70"> · oculto</span>}
            </button>
          ))}
          {!jobs.length && <p className="muted text-sm px-1">Todavía no hay fichas.</p>}
        </div>
        <button
          className="pill w-full mt-4"
          onClick={() => {
            const created = emptyCar();
            setJobs((current) => [...current, created]);
            setSelected(created.id);
          }}
        >
          + Nuevo auto
        </button>
      </aside>

      <section className="glass rounded-3xl p-6 md:p-8 space-y-5">
        <p className="muted text-sm">
          Cada ficha es un auto que ya salió del taller. Sube fotos y videos de las modificaciones y publícala en Resultados.
        </p>
        {!job ? (
          <p className="muted">Crea el primer auto con el botón de la izquierda.</p>
        ) : (
          <>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block text-sm">
            Título
            <input className="field mt-2" value={job.title} onChange={(event) => patch({ title: event.target.value })} placeholder="Kit GT en Corolla 2022" />
          </label>
          <label className="block text-sm">
            Auto
            <input className="field mt-2" value={job.car} onChange={(event) => patch({ car: event.target.value })} placeholder="Toyota Corolla" />
          </label>
          <label className="block text-sm">
            Año
            <input className="field mt-2" value={job.year} onChange={(event) => patch({ year: event.target.value })} placeholder="2022" />
          </label>
          <label className="flex items-center gap-2 text-sm mt-7">
            <input type="checkbox" checked={job.published} onChange={(event) => patch({ published: event.target.checked })} />
            Publicado en la web
          </label>
        </div>
        <label className="block text-sm">
          Qué se hizo
          <textarea className="field mt-2 min-h-24" value={job.blurb} onChange={(event) => patch({ blurb: event.target.value })} />
        </label>
        <label className="block text-sm">
          Modificaciones (una por línea)
          <textarea
            className="field mt-2 min-h-24"
            value={job.mods.join('\n')}
            onChange={(event) => patch({ mods: event.target.value.split('\n').map((line) => line.trim()).filter(Boolean) })}
            placeholder={'Alerón GT\nFaros LED\nRines 17'}
          />
        </label>
        <label className="block text-sm">
          Foto de portada
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="block mt-3 text-xs"
            onChange={(event) => {
              void addFiles(event.target.files, 'cover');
              event.currentTarget.value = '';
            }}
          />
        </label>
        {job.cover && <img src={job.cover} alt="" className="w-40 h-28 object-cover rounded-xl border border-line" />}
        <label className="block text-sm">
          Fotos de la modificación
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            className="block mt-3 text-xs"
            onChange={(event) => {
              void addFiles(event.target.files, 'photo');
              event.currentTarget.value = '';
            }}
          />
        </label>
        {job.photos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.photos.map((src) => (
              <button
                key={src}
                type="button"
                className="relative"
                onClick={() => patch({ photos: job.photos.filter((item) => item !== src), cover: job.cover === src ? job.photos.find((item) => item !== src) || '' : job.cover })}
                title="Quitar foto"
              >
                <img src={src} alt="" className="w-24 h-16 object-cover rounded-lg border border-line" />
              </button>
            ))}
          </div>
        )}
        <label className="block text-sm">
          Videos (MP4, WebM o MOV, máx. 50 MB)
          <input
            type="file"
            multiple
            accept="video/*,.mp4,.mov,.webm,.m4v,.mkv"
            className="block mt-3 text-xs"
            onChange={(event) => {
              void addFiles(event.target.files, 'video');
              event.currentTarget.value = '';
            }}
          />
        </label>
        {job.videos.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {job.videos.map((src) => (
              <div key={src} className="space-y-2">
                <video src={src} className="w-full rounded-xl border border-line bg-plaza" controls preload="metadata" />
                <button className="pill py-1.5" onClick={() => patch({ videos: job.videos.filter((item) => item !== src) })}>
                  Quitar video
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <button disabled={busy || !jobs.length} className="redbtn" onClick={() => void save()}>
            {busy ? 'PROCESANDO…' : 'GUARDAR RESULTADOS'}
          </button>
          {jobs.length > 0 && (
            <button
              className="pill"
              onClick={() => {
                if (!confirm(`¿Quitar ${job.title || job.car || 'este auto'}?`)) return;
                const next = jobs.filter((entry) => entry.id !== job.id);
                setJobs(next);
                setSelected(next[0]?.id ?? '');
              }}
            >
              Eliminar auto
            </button>
          )}
        </div>
        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}
          </>
        )}
      </section>
    </div>
  );
}
