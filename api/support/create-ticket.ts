import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for admin operations
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    userId,
    userName,
    userEmail,
    subject,
    description,
    category,
    priority,
    chatHistory,
    estimatedEta,
  } = req.body;

  if (!userId || !subject || !description || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create ticket
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        subject,
        description,
        category,
        priority: priority || 'normal',
        vopsy_conversation: chatHistory,
        estimated_eta: estimatedEta,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating ticket:', error);
      return res.status(500).json({ error: 'Failed to create ticket' });
    }

    // Send email notification to owner
    await fetch(`${process.env.VERCEL_URL}/api/notify/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'tania@virtualopsassist.com',
        subject: `New Support Ticket: ${ticket.ticket_number} - ${subject}`,
        body: `
          Ticket: ${ticket.ticket_number}
          From: ${userName} (${userEmail})
          Category: ${category}
          Priority: ${priority || 'normal'}
          
          ${description}
          
          View ticket: https://virtualopsassist.com/support-admin
        `,
      }),
    });

    return res.status(200).json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        estimatedEta: ticket.estimated_eta,
      },
    });
  } catch (error) {
    console.error('Ticket creation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
