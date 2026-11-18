import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import authRoutes from './authRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import patientRoutes from './patientRoutes.js';
import statsRoutes from './statsRoutes.js';
import auditRoutes from './auditRoutes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));
router.use('/auth', authRoutes);

// Everything below requires a valid session and the admin role.
router.use(requireAuth, requireRole('admin'));
router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
router.use('/stats', statsRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
