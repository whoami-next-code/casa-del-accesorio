import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminPin, adminToken } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { pin?: string } | null;
  if (!body?.pin || body.pin !== adminPin()) {
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
