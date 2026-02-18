import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { escalationId, connectionMethod } = req.body;
  // connectionMethod: 'chat' | 'zoom' | 'phone' | 'email'

  if (!escalationId || !connectionMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Update escalation status
    await supabase
      .from('support_escalations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        connection_method: connectionMethod,
      })
      .eq('id', escalationId);

    // Get the escalation details
    const { data: esc, error } = await supabase
      .from('support_escalations')
      .select('*')
      .eq('id', escalationId)
      .single();

    if (error || !esc) {
      return res.status(404).json({ error: 'Escalation not found' });
    }

    // Notify user through VOPSy
    let userMessage = '';
    switch (connectionMethod) {
      case 'zoom':
        userMessage = "Great news — Tania is ready to help! She's sending you a Zoom link now. Check your email.";
        break;
      case 'phone':
        userMessage = "Tania is going to call you shortly. Make sure your phone is nearby!";
        break;
      case 'chat':
        userMessage = "Tania is here! She'll continue this conversation with you directly.";
        break;
      case 'email':
        userMessage = "Tania is sending you a detailed response via email. Check your inbox shortly.";
        break;
    }

    // TODO: Send message via VOPSy chat system
    // await sendVOPSyMessage(esc.user_id, userMessage);

    return res.status(200).json({
      success: true,
      message: userMessage,
    });
  } catch (error) {
    console.error('Accept escalation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
