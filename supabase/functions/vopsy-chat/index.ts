import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Use Lovable AI (no API key needed)
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
      error: errorMessage,
      success: false,
      // Fallback response if AI fails
      message: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. In the meantime, you can explore the dashboard or check your integrations."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
