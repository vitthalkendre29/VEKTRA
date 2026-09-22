import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession } from './auth';

// Server-only helper: reads + verifies the session cookie for the current
// request. Returns null when there's no valid session — callers decide
// whether that means "redirect to /login" (pages) or "401" (API routes).
export async function getSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export async function requireApiSession() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: Response.json({ error: 'Not authenticated.' }, { status: 401 }) };
  }
  return { session, error: null };
}
