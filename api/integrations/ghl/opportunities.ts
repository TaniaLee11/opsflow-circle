import type { VercelRequest, VercelResponse} from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  try {
    // Fetch opportunities from user's GHL account
    const response = await fetch(
      'https://services.leadconnectorhq.com/opportunities/search',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 100,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch GHL opportunities');
    }

    const data = await response.json();
    
    // Transform to unified deal format
    const opportunities = (data.opportunities || []).map((opp: any) => ({
      id: opp.id,
      title: opp.name,
      value: opp.monetaryValue || 0,
      stage: opp.status,
      contactName: opp.contact?.name,
    }));

    return res.status(200).json({ opportunities });
  } catch (error) {
    console.error('GHL API error:', error);
    return res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
}
