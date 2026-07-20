/**
 * HTML Email Templates matching StudyOS dark aesthetic branding.
 */

export const getVerificationOtpTemplate = ({ otp, name = 'Student' }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - StudyOS</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0b14; color: #e2e8f0; }
    .wrapper { width: 100%; padding: 40px 0; background-color: #0b0b14; }
    .container { max-width: 520px; margin: 0 auto; background-color: #131322; border: 1px solid #232338; border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
    .logo { text-align: center; margin-bottom: 28px; }
    .badge { display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; color: #fff; font-size: 26px; font-weight: bold; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); }
    .title { font-size: 24px; font-weight: 900; color: #ffffff; margin-top: 12px; margin-bottom: 0; text-align: center; }
    h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; text-align: center; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0; text-align: center; }
    .otp-box { background: linear-gradient(135deg, #1e1e38 0%, #15152a 100%); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #818cf8; margin: 0; text-shadow: 0 0 15px rgba(129, 140, 248, 0.4); }
    .otp-expiry { font-size: 12px; color: #f59e0b; margin-top: 10px; font-weight: 600; }
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
      <h1>Verify Your Email Address</h1>
      <p>Welcome to StudyOS, ${name}! Enter the 6-digit verification code below to activate your account:</p>
      
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">⏱️ Expires in 5 minutes</div>
      </div>

      <p>If you didn't create an account with StudyOS, you can safely ignore this email.</p>

      <div class="footer">
        &copy; ${new Date().getFullYear()} StudyOS — Real-Time Productivity Suite
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export const getResetPasswordOtpTemplate = ({ otp, name = 'Student' }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password OTP - StudyOS</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0b14; color: #e2e8f0; }
    .wrapper { width: 100%; padding: 40px 0; background-color: #0b0b14; }
    .container { max-width: 520px; margin: 0 auto; background-color: #131322; border: 1px solid #232338; border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
    .logo { text-align: center; margin-bottom: 28px; }
    .badge { display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; color: #fff; font-size: 26px; font-weight: bold; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); }
    .title { font-size: 24px; font-weight: 900; color: #ffffff; margin-top: 12px; margin-bottom: 0; text-align: center; }
    h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; text-align: center; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0; text-align: center; }
    .otp-box { background: linear-gradient(135deg, #1e1e38 0%, #15152a 100%); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #818cf8; margin: 0; text-shadow: 0 0 15px rgba(129, 140, 248, 0.4); }
    .otp-expiry { font-size: 12px; color: #ef4444; margin-top: 10px; font-weight: 600; }
    .footer { border-top: 1px solid #232338; padding-top: 20px; margin-top: 32px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo">
        <div class="badge">🔒</div>
        <div class="title">StudyOS</div>
      </div>
      <h1>Password Reset Request</h1>
      <p>Hi ${name}, use the 6-digit OTP code below to verify and reset your StudyOS account password:</p>

      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">⏱️ Expires in 5 minutes</div>
      </div>

      <p>If you did not request a password reset, please secure your account immediately.</p>

      <div class="footer">
        &copy; ${new Date().getFullYear()} StudyOS — Real-Time Productivity Suite
      </div>
    </div>
  </div>
</body>
</html>
  `;
};
