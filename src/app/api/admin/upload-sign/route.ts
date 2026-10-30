import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { mediaBucket } from '@/lib/media-bucket';
import { inferContentType, mediaKind } from '@/lib/media-upload';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function extension(type: string, filename = '') {
  const name = filename.toLowerCase();
  if (name.endsWith('.png') || type === 'image/png') return 'png';
  if (name.endsWith('.webp') || type === 'image/webp') return 'webp';
  if (name.endsWith('.gif') || type === 'image/gif') return 'gif';
  if (name.endsWith('.webm') || type === 'video/webm') return 'webm';
  if (name.endsWith('.mov') || type === 'video/quicktime') return 'mov';
  if (name.endsWith('.m4v') || type === 'video/x-m4v') return 'm4v';
  if (name.endsWith('.mkv') || type === 'video/x-matroska') return 'mkv';
  if (name.endsWith('.mp4') || type.startsWith('video/')) return 'mp4';
  return 'jpg';
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    contentType?: string;
    filename?: string;
    folder?: string;
  } | null;
  const filename = String(body?.filename || '');
  const kind = mediaKind(String(body?.contentType || ''), filename);
  if (!kind) {
    return NextResponse.json({ error: 'Usa JPG, PNG, WebP, MP4, MOV o WebM' }, { status: 400 });
  }

  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY para subir archivos.' }, { status: 500 });
  }

  const folder = body?.folder === 'cars' ? 'cars' : 'parts';
  let bucket: string;
  try {
    bucket = await mediaBucket(folder);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo preparar Storage';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const mime = inferContentType({ type: String(body?.contentType || ''), name: filename }, kind);
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension(mime, filename)}`;
  const signed = await db.storage.from(bucket).createSignedUploadUrl(path);
  if (signed.error || !signed.data) {
    return NextResponse.json({ error: signed.error?.message || 'No se pudo firmar la subida' }, { status: 500 });
  }

  const publicUrl = db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  return NextResponse.json({
    path: signed.data.path,
    token: signed.data.token,
    signedUrl: signed.data.signedUrl,
    publicUrl,
    kind,
  });
}
