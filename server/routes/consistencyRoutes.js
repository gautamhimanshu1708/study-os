import express from 'express';
import {
  getConsistencyLogs,
  logDailyActivity,
  getConsistencyStats,
  autoSyncDailyActivity,
} from '../controllers/consistencyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/stats', getConsistencyStats);
router.post('/sync', autoSyncDailyActivity);

router.route('/')
  .get(getConsistencyLogs)
  .post(logDailyActivity);

export default router;
