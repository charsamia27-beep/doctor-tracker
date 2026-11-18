import 'dotenv/config';
import { z } from 'zod';

const WEAK_SECRETS = ['replace-with-a-long-random-string-at-least-32-chars', 'secret', 'changeme'];

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  JWT_ISSUER: z.string().default('doctor-tracker-api'),
  JWT_AUDIENCE: z.string().default('doctor-tracker-web'),
  COOKIE_NAME: z.string().default('dt_token'),
  CSRF_COOKIE_NAME: z.string().default('dt_csrf'),
  CLIENT_ORIGIN: z.string().default('http://localhost:3000'),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().min(1).default(5),
  LOGIN_LOCK_MINUTES: z.coerce.number().int().min(1).default(15),
  AUDIT_RETENTION_DAYS: z.coerce.number().int().min(1).default(180),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;
if (data.NODE_ENV === 'production' && WEAK_SECRETS.includes(data.JWT_SECRET)) {
  console.error('❌ Refusing to start in production with the example JWT_SECRET. Generate one with: openssl rand -base64 48');
  process.exit(1);
}

export const env = {
  ...data,
  isProd: data.NODE_ENV === 'production',
  isTest: data.NODE_ENV === 'test',
  clientOrigins: data.CLIENT_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean),
};
