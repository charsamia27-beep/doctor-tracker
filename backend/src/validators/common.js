import { z } from 'zod';
import mongoose from 'mongoose';

export const objectId = z
  .string()
  .refine((v) => mongoose.isValidObjectId(v), { message: 'Invalid id' });

export const idParam = z.object({ id: objectId });

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .optional();

/** Shared list query params: pagination, search and date range. */
export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional().transform((v) => v || undefined),
  from: isoDate,
  to: isoDate,
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number');
