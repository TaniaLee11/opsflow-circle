import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // For now, log to console
    console.log('Email notification:', { to, subject, body });

    // Example: SendGrid integration
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: to }] }],
    //     from: { email: 'support@virtualopsassist.com' },
    //     subject,
    //     content: [{ type: 'text/plain', value: body }],
    //   }),
    // });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email notification error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
