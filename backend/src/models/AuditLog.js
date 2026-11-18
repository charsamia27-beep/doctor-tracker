import mongoose from 'mongoose';
import { env } from '../config/env.js';

/** Append-only record of who did what, from where. Never updated, auto-expired by TTL. */
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorEmail: { type: String },
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'delete', 'login', 'login_failed', 'account_locked', 'logout', 'password_change'],
    },
    entity: { type: String, required: true, enum: ['doctor', 'patient', 'auth'] },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    summary: { type: String, maxlength: 300 },
    changedFields: [{ type: String }], // field NAMES only — no patient data is copied into logs
    ip: { type: String },
    userAgent: { type: String, maxlength: 300 },
    requestId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entity: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: env.AUDIT_RETENTION_DAYS * 86400, name: 'ttl_createdAt' });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
