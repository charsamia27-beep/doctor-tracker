import { z } from 'zod';

export const auditListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  entity: z.enum(['doctor', 'patient', 'auth']).optional(),
  action: z.enum(['create', 'update', 'delete', 'login', 'login_failed', 'account_locked', 'logout', 'password_change']).optional(),
});
