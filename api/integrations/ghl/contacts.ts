import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  try {
    // Fetch contacts from user's GHL account
    const response = await fetch(
      'https://services.leadconnectorhq.com/contacts/',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Version': '2021-07-28',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch GHL contacts');
    }

    const data = await response.json();
    
    // Transform to unified format
    const contacts = (data.contacts || []).map((contact: any) => ({
      id: contact.id,
      name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
      email: contact.email,
      phone: contact.phone,
      company: contact.companyName,
      tags: contact.tags || [],
      lastActivity: contact.dateUpdated,
    }));

    return res.status(200).json({ contacts });
  } catch (error) {
    console.error('GHL API error:', error);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
}
