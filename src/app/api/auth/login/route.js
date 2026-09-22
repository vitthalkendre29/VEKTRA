import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import { User } from '@/models';
import { signSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';
import { ensureUserBootstrapped } from '@/lib/bootstrap-user';

// Simple in-memory throttle per server instance — mirrors the original
// server's rate limiter (10 attempts / 15 min / IP) without adding a
// dependency. Good enough for a single-instance deployment; for
// multi-instance hosting put this behind a shared store (e.g. Redis).
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function tooManyAttempts(key) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.start > WINDOW_MS) {
    attempts.set(key, { start: now, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (tooManyAttempts(ip)) {
    return NextResponse.json({ error: 'Too many login attempts. Please wait a few minutes and try again.' }, { status: 429 });
  }

  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  await dbConnect();

  // Authenticates against Ledger's OWN users collection with the same
  // credentials — this is what actually proves identity, never an email
  // string taken on trust.
  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const userId = String(user._id);
  await ensureUserBootstrapped(userId);

  const token = await signSession({ userId, email: user.email, name: user.name });

  const res = NextResponse.json({ name: user.name, email: user.email });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
