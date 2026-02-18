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
    // Fetch contacts from Google People API
    const response = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations&pageSize=1000',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Google contacts');
    }

    const data = await response.json();
    
    // Transform to unified format
    const contacts = (data.connections || []).map((person: any) => ({
      id: person.resourceName,
      name: person.names?.[0]?.displayName || 'Unknown',
      email: person.emailAddresses?.[0]?.value,
      phone: person.phoneNumbers?.[0]?.value,
      company: person.organizations?.[0]?.name,
      tags: ['google-contact'],
    }));

    return res.status(200).json({ contacts });
  } catch (error) {
    console.error('Google API error:', error);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
}
