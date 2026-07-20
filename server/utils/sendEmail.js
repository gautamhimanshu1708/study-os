import nodemailer from 'nodemailer';

/**
 * Brevo / Standard SMTP Email Dispatcher using Nodemailer.
 * Reads SMTP credentials strictly from environment variables:
 * - process.env.SMTP_HOST
 * - process.env.SMTP_PORT
 * - process.env.SMTP_USER
 * - process.env.SMTP_PASS
 */

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for port 465, false for 587 or other ports
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Test connection on initialization
    transporter.verify((error) => {
      if (error) {
        console.error('❌ [Brevo SMTP] Connection Failed:', error.message);
      } else {
        console.log('✅ [Brevo SMTP] Server Connected Successfully & Ready to Send Emails');
      }
    });
  }

  return transporter;
};

const sendEmail = async (options) => {
  const mailTransporter = getTransporter();

  const fromName = process.env.FROM_NAME || 'StudyOS Team';
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@studyos.app';
  const sender = `"${fromName}" <${fromEmail}>`;

  if (!mailTransporter) {
    // Development fallback when local SMTP environment variables are missing
    console.log('\n=============================================================');
    console.log('📧 [StudyOS Local Mailer - Brevo SMTP Config Missing in Local .env]');
    console.log(`TO:      ${options.to || options.email}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log('-------------------------------------------------------------');
    console.log(`TEXT:    ${options.text || 'HTML Email Body Provided'}`);
    console.log('=============================================================\n');
    return { success: true, localFallback: true };
  }

  const mailOptions = {
    from: sender,
    to: options.to || options.email,
    subject: options.subject,
    text: options.message || options.text,
    html: options.html,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`✅ [Brevo SMTP] Email delivered to ${mailOptions.to} (Msg ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [Brevo SMTP Error] Failed to send email to ${mailOptions.to}:`, error.message);
    throw error;
  }
};

export default sendEmail;
