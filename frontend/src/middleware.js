import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE = process.env.COOKIE_NAME || 'dt_token';
const secret = process.env.JWT_SECRET ? new TextEncoder().encode(process.env.JWT_SECRET) : null;
const PUBLIC_PATHS = ['/login'];

async function isAuthenticated(token) {
  if (!token) return false;
  if (!secret) return true; // presence check only; the API still verifies every request
  try {
    await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: process.env.JWT_ISSUER || 'doctor-tracker-api',
      audience: process.env.JWT_AUDIENCE || 'doctor-tracker-web',
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Route protection at the edge: unauthenticated users never receive protected HTML,
 * and signed-in users are bounced away from /login. The Express API remains the
 * source of truth and independently verifies the JWT on every call.
 */
export async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const authed = await isAuthenticated(req.cookies.get(COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!authed && !isPublic) {
    const url = new URL('/login', req.url);
    if (pathname !== '/') url.searchParams.set('next', pathname + search);
    const res = NextResponse.redirect(url);
    res.cookies.delete(COOKIE); // drop an expired/invalid token
    return res;
  }
  if (authed && isPublic) return NextResponse.redirect(new URL('/dashboard', req.url));
  return NextResponse.next();
}

export const config = {
  // Skip API proxy, Next internals and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)'],
};
