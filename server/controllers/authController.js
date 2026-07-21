import { validationResult } from 'express-validator';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Helper to send standard auth response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      securityQuestion: user.securityQuestion,
      createdAt: user.createdAt,
    },
  });
};

// ─── @route  POST /api/auth/register ────────────────────────────────────────
// ─── @access Public
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, password, securityQuestion, securityAnswer } = req.body;
  const email = req.body.email?.trim().toLowerCase();

  if (!securityQuestion || !securityAnswer) {
    return res.status(400).json({
      success: false,
      message: 'Security question and security answer are required',
    });
  }

  try {
    console.log(`[REGISTER] Attempting registration for email: "${email}"`);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`[REGISTER] Email already registered: "${email}"`);
      return res
        .status(400)
        .json({ success: false, message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      securityQuestion,
      securityAnswer,
    });

    console.log(`[REGISTER] User created: ${user._id}, stored email: "${user.email}"`);
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ─── @route  POST /api/auth/login ───────────────────────────────────────────
// ─── @access Public
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { password } = req.body;
  const email = req.body.email?.trim().toLowerCase();

  try {
    console.log(`[LOGIN] Attempting login for email: "${email}"`);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`[LOGIN] No user found with email: "${email}"`);
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    console.log(`[LOGIN] User found: ${user._id}, checking password...`);
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      console.log(`[LOGIN] Password mismatch for user: ${user._id}`);
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    console.log(`[LOGIN] Login successful for user: ${user._id}`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ─── @route  POST /api/auth/get-security-question ───────────────────────────
// ─── @access Public
export const getSecurityQuestion = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    res.status(200).json({
      success: true,
      securityQuestion: user.securityQuestion,
    });
  } catch (error) {
    console.error('GetSecurityQuestion error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching security question' });
  }
};

// ─── @route  POST /api/auth/reset-password ──────────────────────────────────
// ─── @access Public
export const resetPassword = async (req, res) => {
  const { email, securityAnswer, newPassword } = req.body;

  if (!email || !securityAnswer || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email, security answer, and new password are required',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters',
    });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+securityAnswer');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const isAnswerMatch = await user.matchSecurityAnswer(securityAnswer);
    if (!isAnswerMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect security answer. Please try again.',
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('ResetPassword error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
};

// ─── @route  GET /api/auth/me ────────────────────────────────────────────────
// ─── @access Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        securityQuestion: user.securityQuestion,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  PUT /api/auth/update-profile ───────────────────────────────────
// ─── @access Private
export const updateProfile = async (req, res) => {
  const { name, avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...(name && { name }), ...(avatar !== undefined && { avatar }) },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        securityQuestion: user.securityQuestion,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
