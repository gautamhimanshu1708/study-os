import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getSecurityQuestion,
  resetPassword,
  getMe,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Validation rules ──────────────────────────────────────────────────────────

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false, outlookdotcom_remove_subaddress: false, yahoo_remove_subaddress: false, icloud_remove_subaddress: false }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('securityQuestion').notEmpty().withMessage('Security question is required'),
  body('securityAnswer').notEmpty().withMessage('Security answer is required'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false, outlookdotcom_remove_subaddress: false, yahoo_remove_subaddress: false, icloud_remove_subaddress: false }),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/get-security-question', getSecurityQuestion);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

export default router;
