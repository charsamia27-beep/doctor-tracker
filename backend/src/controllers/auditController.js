import { AuditLog } from '../models/AuditLog.js';
import { paginate } from '../utils/query.js';

export async function listAuditLogs(req, res) {
  const { page, limit, entity, action } = req.valid.query;
  const filter = {};
  if (entity) filter.entity = entity;
  if (action) filter.action = action;
  const result = await paginate(AuditLog, filter, {
    page,
    limit,
    sort: { createdAt: -1, _id: -1 },
    projection: 'actorEmail action entity entityId summary changedFields createdAt',
  });
  res.json({ success: true, data: result.items, pagination: result.pagination });
}
