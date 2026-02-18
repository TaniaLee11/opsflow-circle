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
    // Fetch recent charges from Stripe
    const response = await fetch(
      'https://api.stripe.com/v1/charges?limit=100',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Stripe transactions');
    }

    const data = await response.json();
    
    // Transform to unified format
    const transactions = (data.data || []).map((charge: any) => ({
      id: charge.id,
      date: new Date(charge.created * 1000).toISOString().split('T')[0],
      amount: charge.amount / 100, // Convert from cents
      description: charge.description || `Charge ${charge.id}`,
      category: 'payment',
    }));

    return res.status(200).json({ transactions });
  } catch (error) {
    console.error('Stripe API error:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}
