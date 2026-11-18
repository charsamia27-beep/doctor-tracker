import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/authController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { changePasswordSchema, loginSchema } from '../validators/auth.js';
import { env } from '../config/env.js';

const router = Router();

const limiterMessage = (msg) => ({ success: false, message: msg });

// Per IP+email: stops credential stuffing against one account without locking out a whole office NAT.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isTest ? 1000 : 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${String(req.body?.email || '').toLowerCase().slice(0, 254)}`,
  message: limiterMessage('Too many login attempts. Try again in 15 minutes.'),
});

const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isTest ? 1000 : 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: limiterMessage('Too many attempts. Try again later.'),
});

router.get('/csrf', auth.csrf);
router.post('/login', loginLimiter, validate({ body: loginSchema }), h(auth.login));
router.post('/logout', optionalAuth, h(auth.logout));
router.get('/me', requireAuth, h(auth.me));
router.patch('/password', requireAuth, sensitiveLimiter, validate({ body: changePasswordSchema }), h(auth.changePassword));

export default router;
