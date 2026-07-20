import express from 'express';
import { logStudySession, getStudySessions, getStudySessionStats } from '../controllers/studySessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(logStudySession)
  .get(getStudySessions);

router.route('/stats')
  .get(getStudySessionStats);

export default router;
