import crypto from 'crypto';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendResendEmail } from '../utils/resendEmail.js';
import { getVerificationOtpTemplate, getResetPasswordOtpTemplate } from '../utils/emailTemplates.js';

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
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
  });
};

// Generate a secure 6-digit numeric OTP string
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash string helper
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// ─── @route  POST /api/auth/register ────────────────────────────────────────
// ─── @access Public
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // If user exists but is unverified, regenerate OTP and resend verification
        const otp = generateOtp();
        existingUser.name = name;
        existingUser.password = password; // Pre-save hook will hash password
        existingUser.verificationOtp = hashOtp(otp);
        existingUser.verificationOtpExpire = Date.now() + 5 * 60 * 1000; // 5 mins
        await existingUser.save();

        await sendResendEmail({
          to: existingUser.email,
          subject: 'StudyOS - Verify Your Email OTP',
          text: `Your StudyOS verification OTP is: ${otp}. Valid for 5 minutes.`,
          html: getVerificationOtpTemplate({ otp, name: existingUser.name }),
        });

        return res.status(200).json({
          success: true,
          message: 'Account already registered but unverified. A new OTP has been sent to your email.',
          email: existingUser.email,
          isVerified: false,
          devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
        });
      }

      return res
        .status(400)
        .json({ success: false, message: 'Email is already registered and verified' });
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes

    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationOtp: hashedOtp,
      verificationOtpExpire: otpExpire,
    });

    // Send Verification Email via Resend
    await sendResendEmail({
      to: user.email,
      subject: 'StudyOS - Verify Your Email OTP',
      text: `Your StudyOS verification OTP is: ${otp}. Valid for 5 minutes.`,
      html: getVerificationOtpTemplate({ otp, name: user.name }),
    });

    res.status(201).json({
      success: true,
      message: 'Account created! Please verify your email using the 6-digit OTP sent to your inbox.',
      email: user.email,
      isVerified: false,
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ─── @route  POST /api/auth/verify-email ────────────────────────────────────
// ─── @access Public
export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required' });
  }

  try {
    const user = await User.findOne({ email }).select('+verificationOtp +verificationOtpExpire');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (user.isVerified) {
      return sendTokenResponse(user, 200, res);
    }

    if (!user.verificationOtpExpire || user.verificationOtpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification OTP has expired (valid for 5 minutes). Please click "Resend Code".',
      });
    }

    const hashedInputOtp = hashOtp(otp.toString().trim());

    if (user.verificationOtp !== hashedInputOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your email and try again.' });
    }

    // OTP Valid - Verify User
    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('VerifyEmail error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

// ─── @route  POST /api/auth/resend-otp ──────────────────────────────────────
// ─── @access Public
export const resendOtp = async (req, res) => {
  const { email, type = 'verification' } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes

    if (type === 'verification') {
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'Account is already verified' });
      }

      user.verificationOtp = hashedOtp;
      user.verificationOtpExpire = otpExpire;
      await user.save({ validateBeforeSave: false });

      await sendResendEmail({
        to: user.email,
        subject: 'StudyOS - Resent Verification OTP',
        text: `Your new StudyOS verification OTP is: ${otp}. Valid for 5 minutes.`,
        html: getVerificationOtpTemplate({ otp, name: user.name }),
      });
    } else if (type === 'forgot-password') {
      user.resetPasswordOtp = hashedOtp;
      user.resetPasswordOtpExpire = otpExpire;
      await user.save({ validateBeforeSave: false });

      await sendResendEmail({
        to: user.email,
        subject: 'StudyOS - Resent Password Reset OTP',
        text: `Your new StudyOS password reset OTP is: ${otp}. Valid for 5 minutes.`,
        html: getResetPasswordOtpTemplate({ otp, name: user.name }),
      });
    }

    res.status(200).json({
      success: true,
      message: 'A new 6-digit OTP code has been sent to your email.',
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('ResendOTP error:', error);
    res.status(500).json({ success: false, message: 'Server error resending OTP' });
  }
};

// ─── @route  POST /api/auth/login ───────────────────────────────────────────
// ─── @access Public
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    // ── LOGIN RESTRICTION FOR UNVERIFIED ACCOUNTS ─────────────────────────────
    if (!user.isVerified) {
      // Auto-resend fresh verification OTP for convenience
      const otp = generateOtp();
      user.verificationOtp = hashOtp(otp);
      user.verificationOtpExpire = Date.now() + 5 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      await sendResendEmail({
        to: user.email,
        subject: 'StudyOS - Complete Your Account Verification',
        text: `Your StudyOS verification OTP is: ${otp}. Valid for 5 minutes.`,
        html: getVerificationOtpTemplate({ otp, name: user.name }),
      });

      return res.status(403).json({
        success: false,
        isUnverified: true,
        email: user.email,
        message: 'Your email address is unverified. We have sent a new 6-digit OTP to your inbox to complete verification.',
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
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
        isVerified: user.isVerified,
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
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  POST /api/auth/forgot-password ─────────────────────────────────
// ─── @access Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Generic success to prevent user enumeration
      return res.status(200).json({
        success: true,
        message: 'If that email address is registered, a password reset OTP has been sent.',
      });
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save({ validateBeforeSave: false });

    await sendResendEmail({
      to: user.email,
      subject: 'StudyOS - Reset Your Password OTP',
      text: `Your StudyOS password reset OTP is: ${otp}. Valid for 5 minutes.`,
      html: getResetPasswordOtpTemplate({ otp, name: user.name }),
    });

    res.status(200).json({
      success: true,
      message: 'Password reset OTP code has been sent to your email.',
      email: user.email,
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('ForgotPassword error:', error);
    res.status(500).json({ success: false, message: 'Server error requesting password reset' });
  }
};

// ─── @route  POST /api/auth/reset-password ──────────────────────────────────
// ─── @access Public
export const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  const token = req.params?.token;

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  try {
    let user;

    if (email && otp) {
      // OTP-based Reset Flow
      user = await User.findOne({ email }).select('+resetPasswordOtp +resetPasswordOtpExpire');
      if (!user) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }

      if (!user.resetPasswordOtpExpire || user.resetPasswordOtpExpire < Date.now()) {
        return res.status(400).json({ success: false, message: 'Reset OTP has expired (valid for 5 minutes). Please request a new one.' });
      }

      const hashedInputOtp = hashOtp(otp.toString().trim());
      if (user.resetPasswordOtp !== hashedInputOtp) {
        return res.status(400).json({ success: false, message: 'Invalid reset OTP code. Please check your email and try again.' });
      }
    } else if (token) {
      // Token-based fallback
      const hashedToken = hashOtp(token);
      user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      }).select('+resetPasswordToken +resetPasswordExpire');

      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    user.password = password;
    user.isVerified = true; // Auto-verify on successful password reset
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('ResetPassword error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
};
