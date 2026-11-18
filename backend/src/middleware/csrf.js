import { randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const csrfCookieOptions = {
  httpOnly: false, // the SPA must read it to echo it back in a header
  secure: env.isProd,
  sameSite: 'strict',
  path: '/',
  maxAge: 8 * 60 * 60 * 1000,
};

export function issueCsrfToken(res) {
  const token = randomBytes(32).toString('base64url');
  res.cookie(env.CSRF_COOKIE_NAME, token, csrfCookieOptions);
  return token;
}

function originOf(url) {
  if (!url) return undefined;
  try {
    return new URL(url).origin;
  } catch {
    return 'invalid';
  }
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * CSRF defence in depth for cookie-authenticated, state-changing requests:
 *  1. Origin / Referer must be one of the allowed frontend origins (when the browser sends one).
 *  2. Double-submit token: the `X-CSRF-Token` header must equal the CSRF cookie. A cross-site
 *     attacker can make the browser send cookies, but cannot read them to forge the header.
 * Combined with SameSite cookies this blocks classic and login CSRF.
 */
export function csrfProtection(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin') || originOf(req.get('referer'));
  if (origin && !env.clientOrigins.includes(origin)) {
    return next(ApiError.forbidden('Request origin not allowed'));
  }

  // Non-browser API clients using a Bearer token are not vulnerable to CSRF.
  const usesBearer = req.get('authorization')?.startsWith('Bearer ') && !req.cookies?.[env.COOKIE_NAME];
  if (usesBearer) return next();

  const cookieToken = req.cookies?.[env.CSRF_COOKIE_NAME];
  const headerToken = req.get('x-csrf-token');
  if (!cookieToken || !headerToken || !safeEqual(cookieToken, headerToken)) {
    return next(ApiError.forbidden('Invalid or missing CSRF token'));
  }
  next();
}
