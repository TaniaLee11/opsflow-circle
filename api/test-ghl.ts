import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const GHL_API_KEY = process.env.GHL_API_KEY;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    return res.status(500).json({ 
      error: 'Server configuration error',
      hasApiKey: !!GHL_API_KEY,
      hasLocationId: !!GHL_LOCATION_ID 
    });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'GHL API test endpoint',
      method: req.method,
      configured: true
    });
  }

  if (req.method === 'POST') {
    const { email, firstName, lastName, tags } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: GHL_LOCATION_ID,
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          tags: tags || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `GHL API error: ${response.status}`);
      }

      const data = await response.json();

      return res.status(200).json({
        success: true,
        contactId: data.contact?.id || data.id,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
