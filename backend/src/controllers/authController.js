import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { DUMMY_HASH, User } from '../models/User.js';
import { cookieOptions, signToken } from '../middleware/auth.js';
import { csrfCookieOptions, issueCsrfToken } from '../middleware/csrf.js';
import { ApiError } from '../utils/ApiError.js';
import { audit } from '../utils/audit.js';

const GENERIC_LOGIN_ERROR = 'Invalid email or password';

function startSession(res, user) {
  res.cookie(env.COOKIE_NAME, signToken(user), cookieOptions);
  issueCsrfToken(res); // rotate the CSRF token on every privilege change
}

/** GET /auth/csrf — hands the SPA a CSRF token before its first state-changing request. */
export function csrf(_req, res) {
  const token = issueCsrfToken(res);
  res.json({ success: true, data: { csrfToken: token } });
}

/** POST /auth/login — rate-limited, timing-safe, with per-account lockout. */
export async function login(req, res) {
  const { email, password } = req.valid.body;
  const user = await User.findOne({ email }).select('+password +failedLoginAttempts +lockUntil');

  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH); // equalise response time
    await audit(req, { action: 'login_failed', entity: 'auth', summary: 'Unknown account', actor: { email } });
    throw ApiError.unauthorized(GENERIC_LOGIN_ERROR);
  }

  if (user.isLocked()) {
    const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new ApiError(423, `Account temporarily locked after too many failed attempts. Try again in ${minutes} minute(s).`);
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    const attempts = (user.failedLoginAttempts || 0) + 1;
    const update = { failedLoginAttempts: attempts };
    const locking = attempts >= env.LOGIN_MAX_ATTEMPTS;
    if (locking) {
      update.lockUntil = new Date(Date.now() + env.LOGIN_LOCK_MINUTES * 60000);
      update.failedLoginAttempts = 0;
    }
    await User.updateOne({ _id: user._id }, { $set: update });
    const actor = { id: user._id, email: user.email };
    await audit(req, { action: locking ? 'account_locked' : 'login_failed', entity: 'auth', actor, summary: `Attempt ${attempts}` });
    if (locking) {
      throw new ApiError(423, `Too many failed attempts. Account locked for ${env.LOGIN_LOCK_MINUTES} minutes.`);
    }
    throw ApiError.unauthorized(GENERIC_LOGIN_ERROR);
  }

  await User.updateOne(
    { _id: user._id },
    { $set: { failedLoginAttempts: 0, lastLoginAt: new Date(), lastLoginIp: req.ip }, $unset: { lockUntil: 1 } }
  );
  startSession(res, user);
  await audit(req, { action: 'login', entity: 'auth', actor: { id: user._id, email: user.email } });
  res.json({ success: true, data: { user: user.toJSON() } });
}

/**
 * POST /auth/logout — clears cookies AND bumps tokenVersion, so a copied token
 * stops working immediately instead of at expiry ("sign out everywhere").
 */
export async function logout(req, res) {
  if (req.user) {
    await User.updateOne({ _id: req.user.id }, { $inc: { tokenVersion: 1 } });
    await audit(req, { action: 'logout', entity: 'auth' });
  }
  const { maxAge: _a, ...clearOpts } = cookieOptions;
  const { maxAge: _b, ...clearCsrf } = csrfCookieOptions;
  res.clearCookie(env.COOKIE_NAME, clearOpts);
  res.clearCookie(env.CSRF_COOKIE_NAME, clearCsrf);
  res.json({ success: true, message: 'Signed out' });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).select('name email role lastLoginAt passwordChangedAt createdAt').lean();
  res.json({ success: true, data: { user: { ...user, id: user._id } } });
}

/** PATCH /auth/password — requires the current password; revokes all other sessions. */
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.valid.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Validation failed', { currentPassword: ['Current password is incorrect'] });
  }
  user.password = newPassword;
  user.tokenVersion += 1;
  await user.save();
  startSession(res, user); // keep this device signed in with a fresh token
  await audit(req, { action: 'password_change', entity: 'auth' });
  res.json({ success: true, message: 'Password updated. Other sessions were signed out.' });
}
