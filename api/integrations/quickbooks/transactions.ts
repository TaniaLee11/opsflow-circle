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
    // Fetch recent transactions (last 90 days)
    const response = await fetch(
      `https://quickbooks.api.intuit.com/v3/company/{realmId}/query?query=SELECT * FROM Payment WHERE TxnDate >= '${getDate90DaysAgo()}' MAXRESULTS 1000`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch QuickBooks transactions');
    }

    const data = await response.json();
    
    // Transform to unified format
    const transactions = (data.QueryResponse?.Payment || []).map((payment: any) => ({
      id: payment.Id,
      date: payment.TxnDate,
      amount: payment.TotalAmt,
      description: `Payment ${payment.PaymentRefNum || payment.Id}`,
      category: 'payment',
    }));

    return res.status(200).json({ transactions });
  } catch (error) {
    console.error('QuickBooks API error:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

function getDate90DaysAgo(): string {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date.toISOString().split('T')[0];
}
