import express from 'express';
import { getDeadlines, createDeadline, updateDeadline, deleteDeadline, toggleDeadline } from '../controllers/deadlineController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getDeadlines).post(createDeadline);
router.route('/:id').put(updateDeadline).delete(deleteDeadline);
router.patch('/:id/toggle', toggleDeadline);

export default router;
