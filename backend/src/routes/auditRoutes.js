import { Router } from 'express';
import { listAuditLogs } from '../controllers/auditController.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auditListQuery } from '../validators/audit.js';

const router = Router();
router.get('/', validate({ query: auditListQuery }), asyncHandler(listAuditLogs));
export default router;
