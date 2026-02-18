/**
 * Vercel Serverless Function: GHL Contacts API
 * Securely proxies requests to GoHighLevel API
 * GET: List contacts
 * POST: Create contact
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const BASE_URL = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Check for API key
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    return res.status(500).json({ error: 'GHL API not configured' });
  }

  // Handle GET - List contacts
  if (req.method === 'GET') {
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

  // Handle POST - Create contact
  if (req.method === 'POST') {
    try {
      const { email, firstName, lastName, tags } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const response = await fetch(
        `${BASE_URL}/contacts/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': API_VERSION,
          },
          body: JSON.stringify({
            locationId: GHL_LOCATION_ID,
            email,
            firstName: firstName || '',
            lastName: lastName || '',
            tags: tags || [],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('GHL Create Contact Error:', errorData);
        return res.status(response.status).json({ 
          error: errorData.message || 'Failed to create contact',
          details: errorData
        });
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        contactId: data.contact?.id || data.id,
        contact: data.contact || data
      });
    } catch (error) {
      console.error('GHL Create Contact Error:', error);
      return res.status(500).json({ 
        error: 'Failed to create contact',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
