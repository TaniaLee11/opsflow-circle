/**
 * Vercel Serverless Function: GHL Contacts API
 * Securely proxies requests to GoHighLevel API
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const BASE_URL = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for API key
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    return res.status(500).json({ error: 'GHL API not configured' });
  }

  try {
    const { limit = '100' } = req.query;
    
    const response = await fetch(
      `${BASE_URL}/contacts/?locationId=${GHL_LOCATION_ID}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': API_VERSION,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('GHL Contacts API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
}
