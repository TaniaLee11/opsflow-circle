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
    // Fetch unpaid invoices from Stripe
    const response = await fetch(
      'https://api.stripe.com/v1/invoices?status=open&limit=100',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Stripe pending payments');
    }

    const data = await response.json();
    
    // Transform to unified deal format
    const pending = (data.data || []).map((invoice: any) => ({
      id: invoice.id,
      title: `Invoice ${invoice.number || invoice.id}`,
      value: invoice.amount_due / 100, // Convert from cents
      stage: 'pending',
      contactName: invoice.customer_name || invoice.customer_email,
    }));

    return res.status(200).json({ pending });
  } catch (error) {
    console.error('Stripe API error:', error);
    return res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
}
