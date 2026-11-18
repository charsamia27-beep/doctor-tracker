import { z } from 'zod';
import { CONDITIONS, GENDERS, SPECIALIZATIONS } from './constants';

// Mirrors the backend zod schemas so users get instant feedback before a round-trip.
const phone = z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number');

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

export const PASSWORD_RULES = [
  { label: 'At least 10 characters', test: (v) => v.length >= 10 },
  { label: 'Uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'Number', test: (v) => /[0-9]/.test(v) },
  { label: 'Symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().max(128).refine((v) => PASSWORD_RULES.every((r) => r.test(v)), 'Password does not meet all requirements'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ['newPassword'], message: 'Must differ from the current password' });

export const doctorSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100),
  specialization: z.enum(SPECIALIZATIONS, { errorMap: () => ({ message: 'Choose a specialization' }) }),
  hospital: z.string().trim().min(2, 'Hospital is required').max(150),
  phone,
  email: z.string().trim().email('Enter a valid email'),
});

export const patientSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100),
  age: z.coerce.number({ invalid_type_error: 'Enter an age' }).int().min(0).max(130),
  gender: z.enum(GENDERS, { errorMap: () => ({ message: 'Choose a gender' }) }),
  phone,
  email: z.string().trim().email('Enter a valid email').or(z.literal('')).optional(),
  condition: z.enum(CONDITIONS, { errorMap: () => ({ message: 'Choose a condition' }) }),
  diagnosis: z.string().trim().max(300).optional(),
  admittedAt: z.string().min(1, 'Pick a date'),
  doctor: z.string().optional(),
});
