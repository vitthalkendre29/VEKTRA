import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

// Route-level gate for the app shell. API routes check the session
// themselves (see lib/api-helpers.withSession) since they need to return
// JSON 401s rather than redirects.
export async function middleware(req) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === '/login';

  if (!session && !isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  if (session && isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|vklogo.png).*)'],
};
