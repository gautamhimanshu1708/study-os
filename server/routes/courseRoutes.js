import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  updateProgress,
  getCourseStats,
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.get('/stats', getCourseStats);

router.route('/')
  .get(getCourses)
  .post(createCourse);

router.route('/:id')
  .get(getCourseById)
  .put(updateCourse)
  .delete(deleteCourse);

router.patch('/:id/progress', updateProgress);

export default router;
