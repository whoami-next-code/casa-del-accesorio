import { supabaseAdmin } from './supabase-admin';

export const PARTS_BUCKET = 'product-images';
export const CARS_BUCKET = 'car-results';
export const MAX_IMAGE = 8 * 1024 * 1024;
export const MAX_VIDEO = 50 * 1024 * 1024;

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_MIME = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
  'video/x-matroska',
  'video/3gpp',
  'video/avi',
  'video/x-msvideo',
  'application/octet-stream',
];
const CARS_MIME = [...IMAGE_MIME, ...VIDEO_MIME, 'application/json', 'text/plain'];

let resolvedCarsBucket: string | null = null;

function isDuplicate(message: string) {
  return /already exists|duplicate|exists/i.test(message);
}

async function updateBucket(id: string, fileSizeLimit: number, allowedMimeTypes: string[]) {
  const db = supabaseAdmin();
  if (!db) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY.');
  const updated = await db.storage.updateBucket(id, {
    public: true,
    fileSizeLimit,
    allowedMimeTypes,
  });
  if (!updated.error) return;
  const relaxed = await db.storage.updateBucket(id, { public: true, fileSizeLimit });
  if (relaxed.error) throw new Error(updated.error.message);
}

async function createOrUpdate(id: string, fileSizeLimit: number, allowedMimeTypes: string[]) {
  const db = supabaseAdmin();
  if (!db) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY.');
  const created = await db.storage.createBucket(id, {
    public: true,
    fileSizeLimit,
    allowedMimeTypes,
  });
  if (created.error && !isDuplicate(created.error.message)) {
    throw new Error(created.error.message);
  }
  await updateBucket(id, fileSizeLimit, allowedMimeTypes);
}

export async function ensurePartsBucket() {
  const db = supabaseAdmin();
  if (!db) return;
  await updateBucket(PARTS_BUCKET, MAX_IMAGE, [...IMAGE_MIME, 'application/json', 'text/plain']).catch(() => undefined);
}

export async function resolveCarsBucket() {
  if (resolvedCarsBucket) return resolvedCarsBucket;
  const db = supabaseAdmin();
  if (!db) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para subir archivos.');

  try {
    await createOrUpdate(CARS_BUCKET, MAX_VIDEO, CARS_MIME);
    resolvedCarsBucket = CARS_BUCKET;
    return resolvedCarsBucket;
  } catch (error) {
    const createMessage = error instanceof Error ? error.message : 'No se pudo crear car-results';
    try {
      await updateBucket(PARTS_BUCKET, MAX_VIDEO, CARS_MIME);
      resolvedCarsBucket = PARTS_BUCKET;
      return resolvedCarsBucket;
    } catch (fallbackError) {
      const updateMessage = fallbackError instanceof Error ? fallbackError.message : 'product-images no acepta video';
      throw new Error(`${createMessage} | ${updateMessage}`);
    }
  }
}

export async function ensureCarsBucket() {
  await resolveCarsBucket();
}

export async function mediaBucket(folder: string) {
  if (folder === 'cars') return resolveCarsBucket();
  await ensurePartsBucket();
  return PARTS_BUCKET;
}
