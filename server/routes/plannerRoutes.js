import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  toggleSubtopicComplete,
  getPlannerStats,
} from '../controllers/plannerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.get('/stats', getPlannerStats);

router.route('/tasks')
  .get(getTasks)
  .post(createTask);

router.route('/tasks/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/tasks/:id/toggle', toggleTaskComplete);
router.patch('/tasks/:id/subtopic/:subtopicId', toggleSubtopicComplete);

export default router;
