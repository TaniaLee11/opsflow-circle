import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { resolveTier, type TechTier } from '../../src/utils/tierResolver';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatRequest {
  message: string;
  userId: string;
  pageContext?: string; // e.g., "Finance > Reconciliation"
}

interface ChatResponse {
  response: string;
  suggestedActions?: Array<{
    label: string;
    page?: string;
    action?: string;
  }>;
  attribution: 'vopsy' | 'tania';
}

// System prompts by tier
function getSystemPrompt(tier: TechTier, planName: string, pageContext?: string): string {
  let basePrompt = '';

  switch (tier) {
    case 'FREE':
      basePrompt = `You are VOPSy, the AI business assistant for Virtual OPS Hub.
This user is on a Free plan. You are a teacher and guide.
- Explain concepts, answer questions, point them to Academy courses
- You cannot access their business data
- You cannot take actions on their behalf
- If they ask you to do something, explain what the action would involve and suggest they upgrade
- Be warm, helpful, and educational
- Never mention tier names, plan names, or pricing`;
      break;

    case 'ASSIST':
      basePrompt = `You are VOPSy, the AI business assistant for Virtual OPS Hub.
This user is on an Assist plan. You are an advisor with data access.
- You can see their connected business data (contacts, transactions, pipeline)
- Analyze their data and give specific recommendations
- You cannot take actions — only advise
- If they ask you to execute something, explain you can advise but they need to take the action manually, or suggest upgrading for automated execution
- Be specific, data-driven, and actionable
- Never mention tier names, plan names, or pricing`;
      break;

    case 'OPS':
      basePrompt = `You are VOPSy, the AI business assistant for Virtual OPS Hub.
This user is on an Operations plan. You are a full operating partner.
- You can see all their connected business data
- You can recommend AND execute actions with their approval
- When you recommend an action, offer to do it: "Want me to handle that?"
- Actions require explicit user approval before execution
- Be proactive, efficient, and action-oriented
- Never mention tier names, plan names, or pricing`;

      // Add Human-Led specific context
      if (planName.toLowerCase().includes('human') || planName.toLowerCase().includes('advisory')) {
        basePrompt += `\n\nWhen discussing taxes, reconciliation, advisory strategy, or compliance review, note that Tania handles these personally. For all other work (automation, categorization, email processing, pipeline updates, follow-ups), you (VOPSy) handle it. Both names appear naturally based on who did the work.`;
      }
      break;
  }

  // Add page context if provided
  if (pageContext) {
    basePrompt += `\n\nThe user is currently viewing the ${pageContext} page. Prioritize responses relevant to this context.`;
  }

  return basePrompt;
}

// Determine attribution based on context
function getAttribution(planName: string, messageContent: string): 'vopsy' | 'tania' {
  const isHumanLed = planName.toLowerCase().includes('human') || planName.toLowerCase().includes('advisory');
  
  if (!isHumanLed) return 'vopsy';

  // Check if message is about Tania-handled topics
  const taniaTopics = ['tax', 'reconcil', 'advisory', 'compliance', 'strategic', 'cfo'];
  const lowerMessage = messageContent.toLowerCase();
  
  if (taniaTopics.some(topic => lowerMessage.includes(topic))) {
    return 'tania';
  }

  return 'vopsy';
}

// Fetch conversation history from Supabase
async function getConversationHistory(userId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('vopsy_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }

  // Reverse to get chronological order (oldest first)
  return (data || []).reverse().map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: msg.created_at,
  }));
}

// Save message to Supabase
async function saveMessage(userId: string, role: 'user' | 'assistant', content: string) {
  const { error } = await supabase
    .from('vopsy_conversations')
    .insert({
      user_id: userId,
      role,
      content,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error saving message:', error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, userId, pageContext } = req.body as ChatRequest;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Missing required fields: message, userId' });
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not set');
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Fetch user profile from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, role')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    // Resolve tier
    const tierInfo = resolveTier(profile.plan, profile.role);
    const systemPrompt = getSystemPrompt(tierInfo.techTier, profile.plan, pageContext);

    // Get conversation history
    const history = await getConversationHistory(userId);

    // Build messages for Claude
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user' as const, content: message },
    ];

    // Call Claude Sonnet
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, but I was unable to generate a response. Please try again.';

    // Save both messages to history
    await saveMessage(userId, 'user', message);
    await saveMessage(userId, 'assistant', assistantMessage);

    // Determine attribution
    const attribution = getAttribution(profile.plan, message);

    // Build response
    const chatResponse: ChatResponse = {
      response: assistantMessage,
      attribution,
      suggestedActions: [], // TODO: Parse suggested actions from response
    };

    return res.status(200).json(chatResponse);

  } catch (error) {
    console.error('VOPSy chat error:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
