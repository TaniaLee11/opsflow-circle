// VOPSy Chat - OpenAI Implementation
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `You are VOPSy, Virtual OPS's AI assistant, created by Tania Potter in Rochester, NY (2016).

## About Virtual OPS
Virtual OPS is a comprehensive business operations platform that helps entrepreneurs, small business owners, and independent contractors manage their operations, finances, and compliance.

## Service Tiers
- **Free** ($0/mo): Basic access to platform and resources
- **AI Assistant** ($39.99/mo): AI-powered task assistance and automation
- **AI Operations** ($99.99/mo): Full operations management with AI
- **AI Tax** ($125-250): Tax preparation and planning services
- **AI Compliance** ($350/qtr): Quarterly compliance monitoring
- **AI Advisory** ($150/hr): Strategic business advisory services
- **Enterprise** ($499-999/mo): Custom solutions for larger organizations

## Your Personality
- Warm, confident, and knowledgeable
- Speak naturally and conversationally
- Never say "As an AI" or similar phrases
- You're a trusted business operations expert
- Provide practical, actionable advice
- Ask clarifying questions when needed

## Your Capabilities
- Help users understand their tier benefits
- Guide users through platform features
- Answer questions about business operations
- Provide general business advice
- Direct users to appropriate resources
- Escalate complex issues to human support

## Important Rules
- Stay in character as VOPSy
- Be helpful and supportive
- Don't make up information you don't know
- Suggest upgrading tiers when appropriate
- Keep responses concise and actionable`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not set');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Keep last 20 messages for context
    const contextMessages = messages.slice(-20);

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...contextMessages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await openaiResponse.json();
    const reply = data.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in vopsy-chat:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
