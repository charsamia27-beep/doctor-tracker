import { z } from 'zod';
import { GENDERS, PATIENT_CONDITIONS } from '../models/constants.js';
import { listQuery, objectId, phone } from './common.js';

export const patientBody = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100),
  age: z.coerce.number().int().min(0).max(130),
  gender: z.enum(GENDERS),
  phone,
  email: z.string().trim().toLowerCase().email().max(254).optional().or(z.literal('').transform(() => undefined)),
  condition: z.enum(PATIENT_CONDITIONS),
  diagnosis: z.string().trim().max(300).optional(),
  admittedAt: z.coerce.date().max(new Date(Date.now() + 86400000), 'Admission date cannot be in the future').optional(),
  doctor: objectId,
}).strict();

/** When adding a patient from the doctor page the doctor id comes from the URL. */
export const patientForDoctorBody = patientBody.omit({ doctor: true });

export const patientUpdate = patientBody.partial().refine((o) => Object.keys(o).length > 0, {
  message: 'Provide at least one field to update',
});

export const patientListQuery = listQuery.extend({
  condition: z.enum(PATIENT_CONDITIONS).optional(),
  gender: z.enum(GENDERS).optional(),
  doctor: objectId.optional(),
  sort: z.enum(['admittedAt', 'name', 'age']).default('admittedAt'),
});
