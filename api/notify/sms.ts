import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }

  try {
    // Send SMS via GoHighLevel
    const response = await fetch('https://services.leadconnectorhq.com/conversations/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'SMS',
        contactId: process.env.OWNER_GHL_CONTACT_ID, // Tania's contact ID in GHL
        message,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS via GHL');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('SMS notification error:', error);
    // Fallback: log to console if GHL fails
    console.log('SMS (fallback):', message);
    return res.status(200).json({ success: true, fallback: true });
  }
}
