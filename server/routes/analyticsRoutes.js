import express from 'express';
import { getAnalyticsSummary } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', getAnalyticsSummary);

export default router;
