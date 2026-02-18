import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    // Find escalations that haven't been followed up in 15+ minutes
    const { data: pending, error } = await supabase
      .from('support_escalations')
      .select('*')
      .eq('status', 'pending')
      .lt('last_followup_at', fifteenMinAgo);

    if (error) {
      console.error('Error fetching pending escalations:', error);
      return res.status(500).json({ error: 'Failed to fetch escalations' });
    }

    for (const esc of pending || []) {
      // Send follow-up message to user's support chat
      const message = getFollowUpMessage(esc.followup_count);
      
      // TODO: Send message via VOPSy chat system
      // await sendVOPSyMessage(esc.user_id, message);

      // Update escalation record
      await supabase
        .from('support_escalations')
        .update({
          last_followup_at: new Date().toISOString(),
          followup_count: esc.followup_count + 1,
        })
        .eq('id', esc.id);

      // Re-notify owner if waiting > 30 minutes (2+ follow-ups)
      if (esc.followup_count >= 2) {
        await fetch(`${process.env.VERCEL_URL}/api/notify/sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `⚠️ ${esc.user_name} still waiting for support (${esc.followup_count * 15}+ min). Check dashboard.`,
          }),
        });
      }
    }

    return res.status(200).json({
      success: true,
      checked: pending?.length || 0,
    });
  } catch (error) {
    console.error('Follow-up cron error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function getFollowUpMessage(count: number): string {
  switch (count) {
    case 0:
      return "Tania has been notified. She'll be with you as soon as possible. Hang tight!";
    case 1:
      return "Still working on getting you connected with Tania. Shouldn't be long.";
    case 2:
      return "You're still in the queue. Tania is aware. Is there anything else I can help with in the meantime?";
    default:
      return "Thank you for your patience. Tania will reach out as soon as she's available.";
  }
}
