/**
 * Vercel Serverless Function: GHL Integrations Status API
 * Checks which integrations are connected in GoHighLevel
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
    // Fetch location details which includes integrations info
    const response = await fetch(
      `${BASE_URL}/locations/${GHL_LOCATION_ID}`,
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
    
    // Extract integration status
    const integrations = {
      gohighlevel: { connected: true, name: 'GoHighLevel' },
      quickbooks: { connected: false, name: 'QuickBooks' },
      google: { connected: false, name: 'Google' },
      facebook: { connected: false, name: 'Facebook' },
      tiktok: { connected: false, name: 'TikTok' },
      ga4: { connected: false, name: 'Google Analytics 4' },
    };

    // Check for connected integrations (this structure may vary based on GHL API)
    // You'll need to adjust based on actual API response
    if (data.location?.settings?.integrations) {
      const connectedIntegrations = data.location.settings.integrations;
      
      if (connectedIntegrations.quickbooks) integrations.quickbooks.connected = true;
      if (connectedIntegrations.google) integrations.google.connected = true;
      if (connectedIntegrations.facebook) integrations.facebook.connected = true;
      if (connectedIntegrations.tiktok) integrations.tiktok.connected = true;
      if (connectedIntegrations.ga4 || connectedIntegrations.googleAnalytics) integrations.ga4.connected = true;
    }

    return res.status(200).json({ integrations });
  } catch (error) {
    console.error('GHL Integrations API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch integrations' });
  }
}
