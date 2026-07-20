/**
 * Generates responsive, high-fidelity HTML email template for password resets.
 */
export const getPasswordResetEmailHtml = ({ resetUrl, userName = 'Student' }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your StudyOS Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0b14;
      color: #e2e8f0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #0b0b14;
      padding: 40px 0;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #131322;
      border: 1px solid #232338;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo-badge {
      display: inline-block;
      width: 48px;
      height: 48px;
      line-height: 48px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 14px;
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
    }
    .logo-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #ffffff;
      margin-top: 10px;
      margin-bottom: 0;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 12px;
      text-align: center;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #94a3b8;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);
      transition: all 0.2s ease;
    }
    .link-box {
      background-color: #1a1a2e;
      border: 1px solid #2d2d48;
      border-radius: 10px;
      padding: 12px 16px;
      font-family: monospace;
      font-size: 12px;
      color: #818cf8;
      word-break: break-all;
      margin-bottom: 24px;
    }
    .footer {
      border-top: 1px solid #232338;
      padding-top: 24px;
      margin-top: 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo">
        <div class="logo-badge">⚡</div>
        <div class="logo-title">StudyOS</div>
      </div>

      <h1>Password Reset Request</h1>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password for your <strong>StudyOS</strong> account. Click the button below to set up a new password:</p>

      <div class="btn-container">
        <a href="${resetUrl}" target="_blank" class="btn">Reset Password</a>
      </div>

      <p>Or copy and paste this link into your browser:</p>
      <div class="link-box">${resetUrl}</div>

      <p>This password reset link will expire in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.</p>

      <div class="footer">
        &copy; ${new Date().getFullYear()} StudyOS — Real-Time Productivity Platform.
      </div>
    </div>
  </div>
</body>
</html>
  `;
};
