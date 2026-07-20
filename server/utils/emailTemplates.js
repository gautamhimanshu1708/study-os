/**
 * Premium HTML Email Templates matching StudyOS dark aesthetic branding.
 */

// Shared HTML Shell Style & Layout
const getEmailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b14; color: #e2e8f0; }
    .wrapper { width: 100%; padding: 40px 0; background-color: #0b0b14; }
    .container { max-width: 520px; margin: 0 auto; background-color: #131322; border: 1px solid #232338; border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
    .logo { text-align: center; margin-bottom: 28px; }
    .badge { display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; color: #fff; font-size: 26px; font-weight: bold; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); margin: 0 auto; }
    .title { font-size: 24px; font-weight: 900; color: #ffffff; margin-top: 12px; margin-bottom: 0; text-align: center; letter-spacing: -0.5px; }
    h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; text-align: center; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0; text-align: center; }
    .otp-box { background: linear-gradient(135deg, #1e1e38 0%, #15152a 100%); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #818cf8; margin: 0; text-shadow: 0 0 15px rgba(129, 140, 248, 0.4); }
    .otp-expiry { font-size: 12px; color: #f59e0b; margin-top: 10px; font-weight: 600; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 12px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35); }
    .footer { border-top: 1px solid #232338; padding-top: 20px; margin-top: 32px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo">
        <div class="badge">⚡</div>
        <div class="title">StudyOS</div>
      </div>
      ${content}
      <div class="footer">
        &copy; ${new Date().getFullYear()} StudyOS — Real-Time Productivity Suite
      </div>
    </div>
  </div>
</body>
</html>
`;

// 1. Verify Email OTP Template
export const getVerificationOtpTemplate = ({ otp, name = 'Student' }) => {
  const content = `
    <h1>Verify Your Email Address</h1>
    <p>Welcome to StudyOS, <strong>${name}</strong>! Enter the 6-digit verification code below to activate your account:</p>
    
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-expiry">⏱️ Expires in 5 minutes</div>
    </div>

    <p>If you didn't create an account with StudyOS, you can safely ignore this email.</p>
  `;
  return getEmailWrapper(content);
};

// 2. Forgot Password OTP Template
export const getResetPasswordOtpTemplate = ({ otp, name = 'Student' }) => {
  const content = `
    <h1>Password Reset Request</h1>
    <p>Hi <strong>${name}</strong>, use the 6-digit OTP code below to verify and reset your StudyOS account password:</p>

    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-expiry" style="color: #ef4444;">⏱️ Expires in 5 minutes</div>
    </div>

    <p>If you did not request a password reset, please secure your account immediately.</p>
  `;
  return getEmailWrapper(content);
};

// 3. Password Reset Successful Notification Template
export const getPasswordResetSuccessTemplate = ({ name = 'Student' }) => {
  const content = `
    <h1>Password Reset Successful</h1>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your password for your <strong>StudyOS</strong> account was successfully updated. You can now sign in with your new password.</p>
    
    <div class="btn-container">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="btn">Sign In to StudyOS</a>
    </div>

    <p style="font-size: 12px; color: #ef4444;">If you did not perform this change, please contact support immediately.</p>
  `;
  return getEmailWrapper(content);
};

// 4. Welcome Email Template (Sent after email verification)
export const getWelcomeEmailTemplate = ({ name = 'Student' }) => {
  const content = `
    <h1>Welcome to StudyOS! 🚀</h1>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Congratulations! Your email has been verified and your account is now fully active.</p>
    <p>StudyOS is built to help you conquer your academic goals with high-performance focus timers, interactive planners, course trackers, and real-time analytics.</p>
    
    <div class="btn-container">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">Go to Dashboard</a>
    </div>

    <p>We're thrilled to have you on board. Let's make study sessions productive and effortless!</p>
  `;
  return getEmailWrapper(content);
};
