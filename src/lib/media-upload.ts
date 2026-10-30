export function mediaKind(contentType: string, filename = '') {
  const type = contentType.toLowerCase();
  const name = filename.toLowerCase();
  if (type.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/.test(name)) return 'photo' as const;
  if (type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv|avi|3gp)$/.test(name)) return 'video' as const;
  return null;
}

export function inferContentType(file: Pick<File, 'type' | 'name'>, kind: 'photo' | 'video') {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (type && type !== 'application/octet-stream') return type;
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.gif')) return 'image/gif';
  if (name.endsWith('.webm')) return 'video/webm';
  if (name.endsWith('.mov')) return 'video/quicktime';
  if (name.endsWith('.m4v')) return 'video/x-m4v';
  if (name.endsWith('.mkv')) return 'video/x-matroska';
  if (name.endsWith('.mp4') || kind === 'video') return 'video/mp4';
  return 'image/jpeg';
}

function explainUploadError(status: number, detail: string) {
  const text = detail.toLowerCase();
  if (status === 413 || /exceeded|too large|payload/i.test(text)) {
    return 'El archivo pesa más de lo permitido (fotos 8 MB, videos 50 MB).';
  }
  if (/mime|not supported|content-type/i.test(text)) {
    return 'Supabase rechazó el formato. Usa MP4 o WebM para video, JPG/PNG/WebP para fotos.';
  }
  if (/row-level security|not authorized|unauthorized|403/.test(text)) {
    return 'No hay permiso para subir a Storage. Revisa las políticas del bucket.';
  }
  return detail || `No se pudo subir el archivo (${status}).`;
}

async function readResponseError(response: Response) {
  const text = await response.text().catch(() => '');
  try {
    const json = JSON.parse(text) as { message?: string; error?: string; msg?: string };
    return json.message || json.error || json.msg || text;
  } catch {
    return text;
  }
}

async function uploadViaServer(file: File, folder: 'cars' | 'parts', kind: 'photo' | 'video') {
  const form = new FormData();
  form.set('file', file);
  form.set('folder', folder);
  const fallback = await fetch('/api/admin/upload', { method: 'POST', body: form });
  const data = (await fallback.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!fallback.ok || !data?.url) {
    throw new Error(data?.error || explainUploadError(fallback.status, ''));
  }
  return { url: data.url, kind };
}

export async function uploadMedia(file: File, folder: 'cars' | 'parts') {
  const kind = mediaKind(file.type, file.name);
  if (!kind) throw new Error('Usa JPG, PNG, WebP, MP4, MOV o WebM.');
  if (kind === 'video' && file.size > 50 * 1024 * 1024) {
    throw new Error('El video no puede pesar más de 50 MB.');
  }
  if (kind === 'photo' && file.size > 8 * 1024 * 1024) {
    throw new Error('La foto no puede pesar más de 8 MB.');
  }

  const contentType = inferContentType(file, kind);
  const sign = await fetch('/api/admin/upload-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentType,
      filename: file.name,
      folder,
    }),
  });
  const payload = (await sign.json().catch(() => null)) as {
    signedUrl?: string;
    publicUrl?: string;
    kind?: 'photo' | 'video';
    error?: string;
  } | null;

  if (sign.ok && payload?.signedUrl && payload.publicUrl) {
    const put = await fetch(payload.signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType, 'x-upsert': 'true' },
      body: file,
    });
    if (put.ok) return { url: payload.publicUrl, kind: payload.kind ?? kind };
    const detail = await readResponseError(put);
    try {
      return await uploadViaServer(file, folder, kind);
    } catch {
      throw new Error(explainUploadError(put.status, detail));
    }
  }

  try {
    return await uploadViaServer(file, folder, kind);
  } catch (error) {
    throw new Error(
      payload?.error || (error instanceof Error ? error.message : 'No se pudo subir el archivo'),
    );
  }
}
