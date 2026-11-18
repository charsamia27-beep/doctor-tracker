import { z } from 'zod';
import { SPECIALIZATIONS } from '../models/constants.js';
import { listQuery, phone } from './common.js';

export const doctorBody = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100),
  specialization: z.enum(SPECIALIZATIONS),
  hospital: z.string().trim().min(2).max(150),
  phone,
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(254),
}).strict(); // unknown keys (e.g. patientCount, _id) are rejected, not silently accepted

export const doctorUpdate = doctorBody.partial().refine((o) => Object.keys(o).length > 0, {
  message: 'Provide at least one field to update',
});

export const doctorListQuery = listQuery.extend({
  specialization: z.enum(SPECIALIZATIONS).optional(),
  hospital: z.string().trim().max(150).optional().transform((v) => v || undefined),
  sort: z.enum(['createdAt', 'name', 'patientCount']).default('createdAt'),
});
