import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Serverless function to create GHL contacts
 * Keeps API key secure on the server side
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, lastName, phone, tags, customFields } = req.body;

  // Validate required fields
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Get GHL credentials from environment variables
  const GHL_API_KEY = process.env.GHL_API_KEY;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.error('Missing GHL environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || '',
        tags: tags || [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('GHL API error:', errorData);
      throw new Error(errorData.message || `GHL API error: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      contactId: data.contact?.id || data.id,
    });
  } catch (error) {
    console.error('Error creating GHL contact:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
