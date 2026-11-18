import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requestId } from './middleware/requestId.js';
import { csrfProtection } from './middleware/csrf.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);             // correct client IP behind one proxy (Next.js / load balancer)
  app.set('query parser', 'simple');     // flat query strings only — no ?a[$gt]=1 objects

  app.use(requestId);
  app.use(
    helmet({
      // JSON-only API: nothing should ever be rendered or framed from it.
      contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
      crossOriginResourcePolicy: { policy: 'same-site' },
      hsts: env.isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    })
  );
  app.use(cors({ origin: env.clientOrigins, credentials: true, allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Request-Id', 'Authorization'] }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: env.isTest ? 10000 : 600,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests, slow down.' },
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '50kb', strict: true }));
  app.use(cookieParser());
  if (!env.isProd && !env.isTest) {
    morgan.token('id', (req) => req.id);
    app.use(morgan(':id :method :url :status :response-time ms'));
  }

  // Authenticated data must never be stored by browsers or shared caches.
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use('/api', csrfProtection, routes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
