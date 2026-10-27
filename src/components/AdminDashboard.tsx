'use client';

import { useEffect, useState } from 'react';
import { CATALOG_CATEGORIES, emptyItem, garageToItem, type CatalogItem, type InventoryStore } from '@/lib/inventory';

const blank: InventoryStore = { whatsapp: '', items: garageToItem() };

export default function AdminDashboard() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');
  const [store, setStore] = useState<InventoryStore>(blank);
  const [selected, setSelected] = useState<string>(blank.items[0]?.id ?? '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const item = store.items.find((entry) => entry.id === selected) ?? store.items[0] ?? emptyItem();

  useEffect(() => {
    fetch('/api/admin/session')
      .then((response) => response.json())
      .then((data: { ok?: boolean }) => {
        setAuthed(Boolean(data.ok));
        if (data.ok) return load();
      })
      .finally(() => setReady(true));
  }, []);

  async function load() {
    const response = await fetch('/api/admin/store');
    if (!response.ok) {
      setAuthed(false);
      return;
    }
    const data = (await response.json()) as InventoryStore;
    setStore(data);
    setSelected((current) => data.items.find((entry) => entry.id === current)?.id ?? data.items[0]?.id ?? '');
  }

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    setBusy(false);
    setPin('');
    if (!response.ok) {
      setMessage('PIN incorrecto');
      return;
    }
    setAuthed(true);
    await load();
  }

  async function save() {
    setBusy(true);
    setMessage('');
    const response = await fetch('/api/admin/store', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store),
    });
    setBusy(false);
    if (!response.ok) {
      setMessage('No se pudo guardar');
      return;
    }
    setStore((await response.json()) as InventoryStore);
    setMessage('Catálogo guardado.');
  }

  async function upload(file: File) {
    const body = new FormData();
    body.set('file', file);
    setBusy(true);
    setMessage('');
    const response = await fetch('/api/admin/upload', { method: 'POST', body });
    setBusy(false);
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(error?.error || 'No se pudo subir la foto');
      return;
    }
    const data = (await response.json()) as { url: string };
    patch({ photo: data.url, images: [...new Set([data.url, ...item.images])] });
    setMessage('Foto subida. Guarda para publicarla.');
  }

  function patch(partial: Partial<CatalogItem>) {
    setStore((current) => ({
      ...current,
      items: current.items.map((entry) => (entry.id === item.id ? { ...entry, ...partial } : entry)),
    }));
  }

  if (!ready) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <p className="muted">Cargando administración…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <form onSubmit={login} className="glass p-8 rounded-2xl w-full max-w-sm space-y-5">
          <h1 className="text-2xl font-bold">Administración</h1>
          <p className="muted text-sm">
            PIN local para cargar piezas y fotos. En demo es <code>lcda</code>. Cámbialo con <code>ADMIN_PIN</code>.
          </p>
          <label className="block text-sm">
            PIN
            <input className="field mt-2" type="password" autoComplete="current-password" required value={pin} onChange={(event) => setPin(event.target.value)} />
          </label>
          <button disabled={busy} className="redbtn w-full">
            {busy ? 'Ingresando…' : 'INGRESAR'}
          </button>
          {message && (
            <p role="alert" className="text-sm text-cta">
              {message}
            </p>
          )}
          <a href="/" className="block text-center muted text-sm">
            ← Volver al showroom
          </a>
        </form>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-10">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Catálogo / admin</h1>
          <p className="muted text-sm mt-1">Sube artículos, fotos y precios. Quedan en este servidor.</p>
        </div>
        <div className="flex gap-2">
          <a href="/" className="pill">
            Ver plaza
          </a>
          <button
            className="pill"
            onClick={() => {
              void fetch('/api/admin/logout', { method: 'POST' }).then(() => setAuthed(false));
            }}
          >
            Salir
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="glass rounded-3xl p-4 h-fit">
          <p className="text-sm text-steel mb-3">Piezas</p>
          <div className="space-y-1 max-h-[70vh] overflow-auto">
            {store.items.map((entry) => (
              <button
                key={entry.id}
                className="w-full text-left rounded-xl px-3 py-2 text-sm"
                data-active={entry.id === item.id}
                style={{
                  background: entry.id === item.id ? 'var(--ink)' : 'transparent',
                  color: entry.id === item.id ? '#fff' : 'inherit',
                }}
                onClick={() => setSelected(entry.id)}
              >
                {entry.name || 'Nueva pieza'}
                {!entry.published && <span className="opacity-70"> · oculta</span>}
              </button>
            ))}
          </div>
          <button
            className="pill w-full mt-4"
            onClick={() => {
              const created = emptyItem();
              setStore((current) => ({ ...current, items: [...current.items, created] }));
              setSelected(created.id);
            }}
          >
            + Nueva pieza
          </button>
        </aside>

        <section className="glass rounded-3xl p-6 md:p-8 space-y-5">
          <label className="block text-sm">
            WhatsApp comercial (código de país, sin +)
            <input
              className="field mt-2"
              value={store.whatsapp}
              onChange={(event) => setStore((current) => ({ ...current, whatsapp: event.target.value }))}
            />
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block text-sm">
              Nombre
              <input className="field mt-2" value={item.name} onChange={(event) => patch({ name: event.target.value })} />
            </label>
            <label className="block text-sm">
              SKU
              <input className="field mt-2" value={item.sku} onChange={(event) => patch({ sku: event.target.value })} />
            </label>
            <label className="block text-sm">
              Categoría
              <select className="field mt-2" value={item.category} onChange={(event) => patch({ category: event.target.value })}>
                {CATALOG_CATEGORIES.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Precio demo (S/)
              <input
                className="field mt-2"
                type="number"
                min="0"
                step="1"
                value={item.price}
                onChange={(event) => patch({ price: Number(event.target.value) })}
              />
            </label>
          </div>
          <label className="block text-sm">
            Descripción
            <textarea className="field mt-2 min-h-24" value={item.blurb} onChange={(event) => patch({ blurb: event.target.value })} />
          </label>
          <label className="block text-sm">
            Specs (una por línea)
            <textarea
              className="field mt-2 min-h-24"
              value={item.specs.join('\n')}
              onChange={(event) => patch({ specs: event.target.value.split('\n').map((line) => line.trim()).filter(Boolean) })}
            />
          </label>
          <div className="flex gap-8 flex-wrap">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={item.published} onChange={(event) => patch({ published: event.target.checked })} />
              Publicada en catálogo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={item.available} onChange={(event) => patch({ available: event.target.checked })} />
              Disponible
            </label>
          </div>
          <label className="block text-sm">
            Foto principal (máx. 5 MB)
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="block mt-3 text-xs"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>
          {item.photo && <img src={item.photo} alt="" className="w-40 h-28 object-cover rounded-xl border border-line" />}
          <div className="flex flex-wrap gap-3">
            <button disabled={busy} className="redbtn" onClick={() => void save()}>
              {busy ? 'PROCESANDO…' : 'GUARDAR CATÁLOGO'}
            </button>
            <button
              className="pill"
              onClick={() => {
                if (!confirm(`¿Quitar ${item.name || 'esta pieza'} del catálogo?`)) return;
                const next = store.items.filter((entry) => entry.id !== item.id);
                setStore((current) => ({ ...current, items: next }));
                setSelected(next[0]?.id ?? '');
              }}
            >
              Eliminar pieza
            </button>
          </div>
          {message && (
            <p role="status" className="text-sm">
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
