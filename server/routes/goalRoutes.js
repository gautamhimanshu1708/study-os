import express from 'express';
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  toggleMilestone,
  getGoalStats,
} from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/stats', getGoalStats);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .get(getGoalById)
  .put(updateGoal)
  .delete(deleteGoal);

router.patch('/:id/progress', updateGoalProgress);
router.patch('/:id/milestones/:milestoneId', toggleMilestone);

export default router;
