import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const JWT_OPTS = { algorithm: 'HS256', issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE };

export const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role, ver: user.tokenVersion }, env.JWT_SECRET, {
    ...JWT_OPTS,
    expiresIn: env.JWT_EXPIRES_IN,
  });

export const cookieOptions = {
  httpOnly: true,   // not readable from JS → an XSS bug cannot steal the session
  secure: env.isProd,
  sameSite: 'lax',  // the frontend proxies /api via Next.js rewrites, so the cookie is first-party
  path: '/',
  maxAge: 8 * 60 * 60 * 1000,
};

function extractToken(req) {
  const header = req.get('authorization');
  return req.cookies?.[env.COOKIE_NAME] || (header?.startsWith('Bearer ') ? header.slice(7) : null);
}

async function resolveUser(token) {
  let payload;
  try {
    // Pin the algorithm (prevents alg=none / algorithm-confusion attacks) and check iss/aud.
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'], issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE });
  } catch {
    return null;
  }
  const user = await User.findById(payload.sub).select('name email role tokenVersion passwordChangedAt').lean();
  // Reject tokens issued before a logout / password change.
  if (!user || user.tokenVersion !== payload.ver) return null;
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, tokenVersion: user.tokenVersion };
}

/** Authentication: httpOnly cookie (browser) or Bearer token (API clients). */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();
  const user = await resolveUser(token);
  if (!user) throw ApiError.unauthorized('Session expired, please sign in again');
  req.user = user;
  next();
});

/** Like requireAuth but never fails — used by logout so it works with an expired cookie. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (token) req.user = (await resolveUser(token)) || undefined;
  next();
});

/** Authorization: restrict a route to specific roles. */
export const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.role) ? next() : next(ApiError.forbidden());
