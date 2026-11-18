import { Router } from 'express';
import { overview } from '../controllers/statsController.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { statsQuery } from '../validators/stats.js';

const router = Router();
router.get('/overview', validate({ query: statsQuery }), asyncHandler(overview));
export default router;
