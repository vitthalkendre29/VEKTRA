import { SignJWT, jwtVerify } from 'jose';

const encoder = new TextEncoder();
const secretKey = () => {
  if (!process.env.JWT_SECRET) throw new Error('Missing JWT_SECRET in .env');
  return encoder.encode(process.env.JWT_SECRET);
};

export const SESSION_COOKIE = 'vektra_session';

// Every VEKTRA login IS a Ledger login — the token carries the Ledger
// user's own _id, so it's the same identity on both sides with nothing
// separate to link or spoof.
export async function signSession({ userId, email, name }) {
  return new SignJWT({ email, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
    .sign(secretKey());
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return { userId: payload.sub, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true, // not readable from client JS — safer than the old localStorage token
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days, matches JWT_EXPIRES_IN default
  };
}
