import { createHmac } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'lcda_admin';

export function adminPin() {
  return process.env.ADMIN_PIN || 'lcda';
}

export function adminToken() {
  const pin = adminPin();
  const secret = process.env.ADMIN_SECRET || pin;
  return createHmac('sha256', secret).update(pin).digest('hex');
}

export async function isAdmin() {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === adminToken();
}
