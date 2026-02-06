// VOPSy Chat v2 - Dual AI Backend (Manus + Claude)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// AI Backend Selection
const AI_BACKEND = Deno.env.get('VOPSY_AI_BACKEND') || 'manus'; // 'manus' or 'claude'

const SYSTEM_PROMPT = `You are VOPSy (Virtual Operations Intelligence), the AI agent inside Virtual OPS Hub.

You function as an Accountant, Financial Organizer, Compliance Guide, and Operations Partner.

Your capabilities depend on the user's subscription tier:
- AI Operations+ tiers: Full execution (can DO work via browser, tools, integrations)
- AI Assistant: Read-only access to integrations
- AI Free: Chat guidance only

You are capable, warm, direct, and practical. You help users understand their business, stay compliant, and make progress.`;

async function callManusAPI(prompt: string, conversationHistory: any[]) {
  const response = await fetch('https://api.manus.ai/v1/tasks', {
    method: 'POST',
    headers: {
      'API_KEY': Deno.env.get('MANUS_API_KEY')!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      agentProfile: 'manus-1.6-max',
      taskMode: 'agent',
      hideInTaskList: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Manus API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Manus API returns task_url - we need to poll for completion
  // For now, return a message indicating task was created
  return {
    message: `Task created. You can view progress at: ${data.task_url}`,
    task_url: data.task_url,
    task_id: data.task_id,
  };
}

async function callClaudeAPI(prompt: string, conversationHistory: any[]) {
  const messages = [
    ...conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    })),
    { role: 'user', content: prompt }
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    message: data.content[0].text,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build full prompt with system context
    let fullPrompt = SYSTEM_PROMPT + '\n\n';
    if (conversationHistory.length > 0) {
      fullPrompt += '## Previous Conversation:\n';
      fullPrompt += conversationHistory.map((m: any) => 
        `${m.role === 'user' ? 'User' : 'VOPSy'}: ${m.content}`
      ).join('\n\n');
      fullPrompt += '\n\n';
    }
    fullPrompt += `## Current User Request:\n${message}`;

    let result;
    
    if (AI_BACKEND === 'manus' && Deno.env.get('MANUS_API_KEY')) {
      console.log('Using Manus AI backend');
      result = await callManusAPI(fullPrompt, conversationHistory);
    } else if (AI_BACKEND === 'claude' && Deno.env.get('ANTHROPIC_API_KEY')) {
      console.log('Using Claude AI backend');
      result = await callClaudeAPI(message, conversationHistory);
    } else {
      // Fallback to original Lovable AI
      console.log('Using fallback Lovable AI backend');
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory,
            { role: 'user', content: message }
          ],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Lovable AI error: ${response.status}`);
      }

      const data = await response.json();
      result = { message: data.choices[0].message.content };
    }

    return new Response(JSON.stringify({ 
      ...result,
      success: true,
      backend: AI_BACKEND,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in vopsy-chat function:', errorMessage);
    return new Response(JSON.stringify({ 
      error: 'An error occurred processing your request. Please try again.',
      success: false,
      message: "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
