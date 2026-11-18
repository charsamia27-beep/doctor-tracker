import { z } from 'zod';

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter a valid email').max(254),
    password: z.string().min(1, 'Password is required').max(128),
  })
  .strict();

/** NIST-style: length matters most, plus mixed character classes. */
export const strongPassword = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(128)
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/[0-9]/, 'Add a number')
  .regex(/[^A-Za-z0-9]/, 'Add a symbol');

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(128),
    newPassword: strongPassword,
  })
  .strict()
  .refine((v) => v.currentPassword !== v.newPassword, { path: ['newPassword'], message: 'New password must be different' });
