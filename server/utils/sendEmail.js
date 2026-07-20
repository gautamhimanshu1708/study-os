import nodemailer from 'nodemailer';

/**
 * Utility to send emails using Nodemailer.
 * Supports configured SMTP credentials (Gmail, Mailtrap, SendGrid, custom SMTP)
 * and falls back to Ethereal / Console logging when credentials are not yet set.
 */
const sendEmail = async (options) => {
  const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const smtpPort = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const fromName = process.env.FROM_NAME || 'StudyOS';
  const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@studyos.app';

  let transporter;

  if (smtpHost && smtpUser && smtpPass) {
    // Standard SMTP / Custom Mailer
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  } else if (smtpUser && smtpPass) {
    // Gmail or standard service fallback
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  } else {
    // Development fallback: Log email details and create Ethereal test transport if possible
    console.log('\n=============================================================');
    console.log('📧 [StudyOS Mailer - No SMTP Configured]');
    console.log(`TO:      ${options.email}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log('-------------------------------------------------------------');
    console.log('BODY preview / HTML link:');
    if (options.resetUrl) {
      console.log(`🔗 Password Reset URL: ${options.resetUrl}`);
    }
    console.log('=============================================================\n');

    // Create Ethereal test account automatically for local development testing
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (testErr) {
      console.warn('Could not create Ethereal test account:', testErr.message);
      return { previewUrl: options.resetUrl || null };
    }
  }

  const message = {
    from: `"${fromName}" <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`\n📬 Ethereal Email Preview URL: ${previewUrl}\n`);
  }

  return { messageId: info.messageId, previewUrl };
};

export default sendEmail;
