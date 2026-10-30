import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { MAX_IMAGE, MAX_VIDEO, mediaBucket } from '@/lib/media-bucket';
import { inferContentType, mediaKind } from '@/lib/media-upload';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
  }

  const kind = mediaKind(file.type, file.name);
  if (!kind) {
    return NextResponse.json({ error: 'Usa JPG, PNG, WebP, MP4, MOV o WebM' }, { status: 400 });
  }
  const limit = kind === 'video' ? MAX_VIDEO : MAX_IMAGE;
  if (file.size > limit) {
    return NextResponse.json(
      { error: kind === 'video' ? 'El video no puede pesar más de 50 MB' : 'La foto no puede pesar más de 8 MB' },
      { status: 400 },
    );
  }

  const contentType = inferContentType(file, kind);
  const ext = file.name.split('.').pop()?.toLowerCase() || (kind === 'video' ? 'mp4' : 'jpg');
  const folder = String(form.get('folder') || 'parts') === 'cars' ? 'cars' : 'parts';
  const bucket = await mediaBucket(folder);
  const name = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const db = supabaseAdmin();
  if (db) {
    const uploaded = await db.storage.from(bucket).upload(name, bytes, {
      contentType,
      upsert: true,
    });
    if (uploaded.error) {
      return NextResponse.json({ error: uploaded.error.message }, { status: 500 });
    }
    const publicUrl = db.storage.from(bucket).getPublicUrl(name).data.publicUrl;
    return NextResponse.json({ url: publicUrl, kind });
  }

  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: 'En Vercel los archivos se suben a Supabase. Falta SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 },
    );
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(dir, { recursive: true });
  const localName = name.split('/').pop() as string;
  await writeFile(path.join(dir, localName), bytes);
  return NextResponse.json({ url: `/uploads/${folder}/${localName}`, kind });
}
