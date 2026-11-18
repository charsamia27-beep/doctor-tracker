import { AuditLog } from '../models/AuditLog.js';

/**
 * Write an audit entry. Failures are logged but never break the user's request —
 * the business operation already succeeded.
 */
export async function audit(req, { action, entity, entityId, summary, changedFields, actor }) {
  try {
    await AuditLog.create({
      actor: actor?.id ?? req.user?.id,
      actorEmail: actor?.email ?? req.user?.email,
      action,
      entity,
      entityId,
      summary,
      changedFields,
      ip: req.ip,
      userAgent: req.get('user-agent')?.slice(0, 300),
      requestId: req.id,
    });
  } catch (err) {
    console.error('[audit] failed to write log', { requestId: req.id, action, entity, err: err.message });
  }
}
