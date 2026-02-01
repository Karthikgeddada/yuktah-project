import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
    try {
        // NOTE: On the free tier without a verified domain, you can ONLY send emails TO the address you signed up with on Resend.
        // If you try to send to other emails, it will fail until you verify a domain.
        const data = await resend.emails.send({
            from: 'Yuktah Health <onboarding@resend.dev>',
            to: [email],
            subject: 'Welcome to Yuktah Health! 🌿',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000;">Welcome to Yuktha Health, ${name}!</h1>
          <p>We're thrilled to have you on board. Yuktha is your partner in better health management.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Getting Started Checklist:</h3>
            <ul style="line-height: 1.6;">
              <li>✅ <strong>Complete your profile</strong> with emergency details</li>
              <li>💊 <strong>Add your medicines</strong> to the tracker</li>
              <li>📄 <strong>Upload a health report</strong> for AI analysis</li>
              <li>👨‍👩‍👧‍👦 <strong>Add family members</strong> to manage care together</li>
            </ul>
          </div>

          <p>If you have any questions, feel free to reply to this email.</p>
          <p>Stay healthy,<br/>The Yuktha Team</p>
        </div>
      `,
        });

        console.log('✅ Email sent successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        return { success: false, error };
    }
}
