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

  const {
    userId,
    userName,
    userEmail,
    summary,
    chatHistory,
    urgency,
  } = req.body;

  if (!userId || !summary) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create escalation
    const { data: escalation, error } = await supabase
      .from('support_escalations')
      .insert({
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        summary,
        vopsy_conversation: chatHistory,
        urgency: urgency || 'normal',
        status: 'pending',
        owner_notified_at: new Date().toISOString(),
        last_followup_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating escalation:', error);
      return res.status(500).json({ error: 'Failed to create escalation' });
    }

    // Send email notification to owner
    await fetch(`${process.env.VERCEL_URL}/api/notify/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'tania@virtualopsassist.com',
        subject: `🔴 Live Support Request: ${userName}`,
        body: `
          ${userName} (${userEmail}) needs immediate help.
          
          Summary: ${summary}
          Urgency: ${urgency || 'normal'}
          
          Open dashboard: https://virtualopsassist.com/dashboard
        `,
      }),
    });

    // Send SMS notification to owner via GHL
    await fetch(`${process.env.VERCEL_URL}/api/notify/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `VOPS Support: ${userName} needs live help. "${summary}" — Check dashboard.`,
      }),
    });

    return res.status(200).json({
      success: true,
      escalationId: escalation.id,
    });
  } catch (error) {
    console.error('Escalation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
