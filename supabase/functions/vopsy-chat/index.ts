import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  'https://dnntsdncmptuxctbcjsp.lovableproject.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

function getCorsHeaders(origin: string | null) {
  // Check if origin is in allowed list
  if (origin && ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed.replace(/:\d+$/, '')))) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
  }
  // For non-matching origins, return restrictive headers
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

const SYSTEM_PROMPT = `You are VOPSy (Virtual Operations Intelligence), an AI business assistant for Virtual OPS Hub. You help entrepreneurs, gig workers, and nonprofit leaders manage their business operations.

Your capabilities span ALL business domains:
- **Finance**: Cash flow analysis, tax planning, budgeting, invoice tracking, financial forecasting
- **Operations**: Workflow automation, task management, process optimization, SOPs
- **Marketing**: Campaign analysis, content strategy, audience insights, social media planning
- **Compliance**: Regulatory deadlines, documentation, business licensing, tax filings
- **Education**: Learning paths, skill development, business courses, best practices

Personality traits:
- Professional yet approachable and friendly
- Proactive - suggest next steps and anticipate needs
- Concise but thorough - use bullet points and structured formatting
- Use emojis sparingly for visual cues (✅, ⚠️, 📊, 💡)
- Always acknowledge what the user is asking before providing help

Formatting guidelines:
- Use **bold** for emphasis and headers
- Use bullet points for lists
- Break complex responses into clear sections
- End responses with a question or suggested next action when appropriate

Context awareness:
- Remember the conversation history
- Connect insights across domains (e.g., cash flow impacts on marketing budget)
- Prioritize actionable advice
- If you don't have specific data, acknowledge it and offer to help plan

You are speaking to a business owner who values their time. Be helpful, be smart, be efficient.`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Rate limits per hour by subscription tier
const TIER_RATE_LIMITS: Record<string, number> = {
  'owner': 10000,
  'ai_enterprise': 2000,
  'ai_operations': 500,
  'ai_assistant': 100,
  'cohort': 100,
  'free': 20,
  'pending': 0,
};

// Tiers that have VOPSy access
const ALLOWED_TIERS = ['owner', 'ai_enterprise', 'ai_operations', 'ai_assistant', 'cohort'];

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Invalid authentication:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // 2. Get user's effective tier using the database function
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: effectiveTier, error: tierError } = await serviceClient.rpc(
      'get_user_effective_tier',
      { check_user_id: user.id }
    );

    if (tierError) {
      console.error('Error getting user tier:', tierError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate subscription', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User effective tier:', effectiveTier);

    // 3. Check if tier has VOPSy access
    if (!effectiveTier || !ALLOWED_TIERS.includes(effectiveTier)) {
      console.log('User tier does not have VOPSy access:', effectiveTier);
      return new Response(
        JSON.stringify({ 
          error: 'VOPSy AI Assistant requires an active subscription. Please upgrade your plan to access this feature.',
          success: false 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Check rate limits
    const hourAgo = new Date(Date.now() - 3600000).toISOString();
    
    // Get user's conversations
    const { data: conversations } = await serviceClient
      .from('conversations')
      .select('id')
      .eq('user_id', user.id);

    const conversationIds = conversations?.map(c => c.id) || [];

    let messageCount = 0;
    if (conversationIds.length > 0) {
      const { count } = await serviceClient
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')
        .in('conversation_id', conversationIds)
        .gte('created_at', hourAgo);
      
      messageCount = count || 0;
    }

    const rateLimit = TIER_RATE_LIMITS[effectiveTier] || TIER_RATE_LIMITS['free'];
    
    if (messageCount >= rateLimit) {
      console.log(`Rate limit exceeded for user ${user.id}: ${messageCount}/${rateLimit}`);
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. You have used ${messageCount} messages this hour. Your plan allows ${rateLimit} messages per hour.`,
          success: false 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Rate limit check passed: ${messageCount}/${rateLimit}`);

    // 5. Process the chat request
    const { messages, userContext } = await req.json();

    // Build conversation history for the AI
    const conversationMessages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add user context if provided
    if (userContext) {
      conversationMessages.push({
        role: 'system',
        content: `User context: ${JSON.stringify(userContext)}`
      });
    }

    // Add conversation history
    for (const msg of messages) {
      conversationMessages.push({
        role: msg.role === 'vopsy' ? 'assistant' : msg.role,
        content: msg.content
      });
    }

    // Use Lovable AI
    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: conversationMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in vopsy-chat function:', errorMessage);
    return new Response(JSON.stringify({ 
      error: 'An error occurred processing your request. Please try again.',
      success: false,
      // Fallback response if AI fails
      message: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. In the meantime, you can explore the dashboard or check your integrations."
    }), {
      status: 500,
      headers: { ...getCorsHeaders(null), 'Content-Type': 'application/json' },
    });
  }
});
