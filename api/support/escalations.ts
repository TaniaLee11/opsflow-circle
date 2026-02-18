import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch all escalations, ordered by most recent first
    const { data: escalations, error } = await supabase
      .from('support_escalations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching escalations:', error);
      return res.status(500).json({ error: 'Failed to fetch escalations' });
    }

    return res.status(200).json({ escalations });
  } catch (error) {
    console.error('Escalations fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
