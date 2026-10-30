import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { CARS_META_ID, CARS_META_SKU, normalizeCar, type CarJob } from './cars';
import { resolveCarsBucket } from './media-bucket';
import { supabaseAdmin, supabaseReader } from './supabase-admin';

const dataDir = path.join(process.cwd(), 'data');
const filePath = path.join(dataDir, 'cars.json');
const ephemeral = Boolean(process.env.VERCEL);
const STORAGE_FILE = 'meta/cars.json';

type CarRow = {
  id: string;
  title?: string | null;
  car?: string | null;
  year?: string | null;
  blurb?: string | null;
  mods?: string[] | null;
  cover?: string | null;
  photos?: string[] | null;
  videos?: string[] | null;
  published?: boolean | null;
};

let memoryCars: CarJob[] | null = null;

function rowToCar(row: CarRow): CarJob {
  return normalizeCar({
    id: row.id,
    title: row.title ?? '',
    car: row.car ?? '',
    year: row.year ?? '',
    blurb: row.blurb ?? '',
    mods: row.mods ?? [],
    cover: row.cover ?? '',
    photos: row.photos ?? [],
    videos: row.videos ?? [],
    published: row.published !== false,
  });
}

function carToRow(job: CarJob, sortOrder: number) {
  return {
    id: job.id,
    title: job.title,
    car: job.car,
    year: job.year,
    blurb: job.blurb,
    mods: job.mods,
    cover: job.cover,
    photos: job.photos,
    videos: job.videos,
    published: job.published,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };
}

function richness(job: CarJob) {
  return job.photos.length + job.videos.length + (job.cover ? 1 : 0) + (job.title ? 1 : 0) + (job.car ? 1 : 0);
}

function mergeJobs(...lists: CarJob[][]) {
  const map = new Map<string, CarJob>();
  for (const list of lists) {
    for (const job of list) {
      const current = map.get(job.id);
      if (!current || richness(job) >= richness(current)) {
        map.set(job.id, current ? { ...current, ...job } : job);
      }
    }
  }
  return [...map.values()];
}

async function readFileCars(): Promise<CarJob[]> {
  try {
    const raw = JSON.parse(await readFile(filePath, 'utf8')) as Partial<CarJob>[];
    return Array.isArray(raw) ? raw.map(normalizeCar) : [];
  } catch {
    return [];
  }
}

async function writeFileCars(jobs: CarJob[]) {
  if (ephemeral) {
    throw new Error('En Vercel los resultados se guardan en Supabase. Falta SUPABASE_SERVICE_ROLE_KEY.');
  }
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, `${JSON.stringify(jobs.map(normalizeCar), null, 2)}\n`, 'utf8');
}

async function parseJobs(raw: unknown): Promise<CarJob[] | null> {
  if (!raw) return null;
  const text = typeof raw === 'string' ? raw : raw instanceof Blob ? await raw.text() : '';
  if (!text) return null;
  const parsed = JSON.parse(text) as Partial<CarJob>[];
  return Array.isArray(parsed) ? parsed.map(normalizeCar) : null;
}

async function readTableCars(): Promise<CarJob[]> {
  const db = supabaseReader();
  if (!db) return [];
  const table = await db.from('car_jobs').select('*').order('sort_order', { ascending: true });
  if (table.error) return [];
  return (table.data ?? []).map(rowToCar);
}

async function readStorageCars(): Promise<CarJob[]> {
  const db = supabaseReader();
  if (!db) return [];
  const bucket = await resolveCarsBucket().catch(() => 'product-images');
  const file = await db.storage.from(bucket).download(STORAGE_FILE);
  if (file.error || !file.data) return [];
  return (await parseJobs(file.data)) ?? [];
}

async function writeStorageCars(jobs: CarJob[]) {
  const db = supabaseAdmin();
  if (!db) throw new Error('No hay cliente de Supabase para guardar resultados.');
  const bucket = await resolveCarsBucket();
  const body = JSON.stringify(jobs, null, 2);
  for (const contentType of ['application/json', 'text/plain']) {
    const uploaded = await db.storage.from(bucket).upload(STORAGE_FILE, body, {
      upsert: true,
      contentType,
    });
    if (!uploaded.error) return;
  }
  throw new Error('No se pudieron guardar los autos en Storage.');
}

async function readMetaCars(): Promise<CarJob[]> {
  const db = supabaseAdmin() ?? supabaseReader();
  if (!db) return [];
  const result = await db.from('catalog_items').select('blurb').eq('id', CARS_META_ID).maybeSingle();
  if (result.error || !result.data?.blurb) return [];
  return (await parseJobs(result.data.blurb)) ?? [];
}

async function writeMetaCars(jobs: CarJob[]) {
  const db = supabaseAdmin();
  if (!db) throw new Error('No hay cliente de Supabase para guardar resultados.');
  const saved = await db.from('catalog_items').upsert({
    id: CARS_META_ID,
    sku: CARS_META_SKU,
    name: 'Resultados de autos',
    category: 'Otros',
    blurb: JSON.stringify(jobs),
    specs: [],
    price: 0,
    photo: '',
    images: [],
    published: false,
    available: false,
    hotspot: null,
    sort_order: 9999,
    updated_at: new Date().toISOString(),
  });
  if (saved.error) throw new Error(`No se pudieron guardar los autos: ${saved.error.message}`);
}

async function writeTableCars(jobs: CarJob[]) {
  const db = supabaseAdmin();
  if (!db) throw new Error('No hay cliente de Supabase para guardar resultados.');
  if (!jobs.length) return;
  const rows = jobs.map((job, index) => carToRow(job, index));
  const tableWrite = await db.from('car_jobs').upsert(rows);
  if (tableWrite.error) throw new Error(tableWrite.error.message);
  const existing = await db.from('car_jobs').select('id');
  if (existing.error) return;
  const keep = new Set(jobs.map((job) => job.id));
  const remove = (existing.data ?? []).map((row) => row.id).filter((id) => !keep.has(id));
  if (remove.length) await db.from('car_jobs').delete().in('id', remove);
}

async function readCarsIgnoringMemory(): Promise<CarJob[]> {
  const remote = await Promise.all([readTableCars(), readStorageCars(), readMetaCars(), readFileCars()]);
  const merged = mergeJobs(...remote);
  if (merged.length) memoryCars = merged;
  return merged;
}

export async function readCars(): Promise<CarJob[]> {
  if (memoryCars?.length) return memoryCars;
  return readCarsIgnoringMemory();
}

export async function writeCars(jobs: CarJob[]) {
  const normalized = jobs.map(normalizeCar);
  if (!normalized.length) {
    const existing = memoryCars?.length ? memoryCars : await readCarsIgnoringMemory();
    if (existing.length) return existing;
    return [];
  }
  memoryCars = normalized;
  const db = supabaseAdmin();
  if (!db) {
    await writeFileCars(normalized);
    return normalized;
  }

  const errors: string[] = [];
  let saved = false;
  const attempts: Array<[string, () => Promise<void>]> = [
    ['tabla', async () => writeTableCars(normalized)],
    ['storage', async () => writeStorageCars(normalized)],
    ['catálogo auxiliar', async () => writeMetaCars(normalized)],
    ['archivo local', async () => writeFileCars(normalized)],
  ];

  for (const [name, attempt] of attempts) {
    try {
      await attempt();
      saved = true;
    } catch (error) {
      errors.push(`${name}: ${error instanceof Error ? error.message : 'falló'}`);
    }
  }

  if (!saved) throw new Error(errors.join(' | '));
  return normalized;
}

export function publishedCars(jobs: CarJob[]) {
  return jobs.filter((job) => job.published);
}
