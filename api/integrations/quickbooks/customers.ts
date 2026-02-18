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
    // Fetch customers from QuickBooks API
    const response = await fetch(
      'https://quickbooks.api.intuit.com/v3/company/{realmId}/query?query=SELECT * FROM Customer MAXRESULTS 1000',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch QuickBooks customers');
    }

    const data = await response.json();
    
    // Transform to unified format
    const customers = (data.QueryResponse?.Customer || []).map((customer: any) => ({
      id: customer.Id,
      name: customer.DisplayName || customer.FullyQualifiedName,
      email: customer.PrimaryEmailAddr?.Address,
      phone: customer.PrimaryPhone?.FreeFormNumber,
      company: customer.CompanyName,
      tags: ['quickbooks-customer'],
    }));

    return res.status(200).json({ customers });
  } catch (error) {
    console.error('QuickBooks API error:', error);
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
}
