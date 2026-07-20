import { Resend } from 'resend';

/**
 * Sends transactional email via Resend API using process.env.RESEND_API_KEY.
 * Default sender: StudyOS Team <onboarding@resend.dev>
 */
export const sendResendEmail = async ({ to, subject, html, text }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'StudyOS Team <onboarding@resend.dev>';

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const data = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
        text,
      });

      console.log(`✅ [Resend] Email delivered successfully to ${to} (ID: ${data.id || data.data?.id})`);
      return { success: true, data };
    } catch (err) {
      console.error(`❌ [Resend Error] Failed to send email to ${to}:`, err.message || err);
      return { success: false, error: err.message };
    }
  } else {
    // Development fallback if RESEND_API_KEY is not present locally
    console.log('\n=============================================================');
    console.log('📧 [StudyOS Local Mailer - RESEND_API_KEY not configured locally]');
    console.log(`TO:      ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log('-------------------------------------------------------------');
    console.log(`TEXT:    ${text || 'HTML body provided'}`);
    console.log('=============================================================\n');
    return { success: true, localFallback: true };
  }
};
