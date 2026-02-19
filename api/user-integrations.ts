import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (req.method === 'GET') {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching integrations:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ integrations: data || [] });
    } catch (error) {
      console.error('Error in GET /api/user-integrations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, integrationId, integrationName, connected, accessToken, refreshToken, tokenExpiresAt, metadata } = req.body;

      if (!userId || !integrationId || !integrationName) {
        return res.status(400).json({ error: 'userId, integrationId, and integrationName are required' });
      }

      const { data, error } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: userId,
          integration_id: integrationId,
          integration_name: integrationName,
          connected: connected ?? false,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: tokenExpiresAt,
          metadata: metadata || {},
          last_sync: new Date().toISOString(),
        }, {
          onConflict: 'user_id,integration_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting integration:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ integration: data });
    } catch (error) {
      console.error('Error in POST /api/user-integrations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { userId, integrationId } = req.query;

      if (!userId || !integrationId) {
        return res.status(400).json({ error: 'userId and integrationId are required' });
      }

      const { error } = await supabase
        .from('user_integrations')
        .delete()
        .eq('user_id', userId)
        .eq('integration_id', integrationId);

      if (error) {
        console.error('Error deleting integration:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error in DELETE /api/user-integrations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
