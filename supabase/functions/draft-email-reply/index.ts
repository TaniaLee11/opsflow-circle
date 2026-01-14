import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DraftRequest {
  originalEmail: {
    id: string;
    subject: string;
    from: string;
    snippet: string;
    summary?: string;
  };
  tone?: "professional" | "friendly" | "brief" | "detailed";
  instructions?: string;
  userContext?: {
    userName: string;
    businessName?: string;
  };
}

interface DraftResponse {
  subject: string;
  body: string;
  tone: string;
  originalEmailId: string;
}

const logStep = (step: string, details?: any) => {
  console.log(`[DRAFT-EMAIL] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User authenticated", { userId: user.id });

    const { originalEmail, tone = "professional", instructions, userContext }: DraftRequest = await req.json();

    if (!originalEmail || !originalEmail.subject || !originalEmail.from) {
      return new Response(
        JSON.stringify({ error: "Original email details required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Drafting reply", { subject: originalEmail.subject, tone });

    // Build the drafting prompt
    const toneDescriptions: Record<string, string> = {
      professional: "professional, polished, and business-appropriate",
      friendly: "warm, personable, and conversational while remaining professional",
      brief: "concise and to-the-point, minimal pleasantries",
      detailed: "thorough and comprehensive, addressing all points clearly",
    };

    const userName = userContext?.userName || user.user_metadata?.full_name || "User";
    const businessContext = userContext?.businessName ? ` from ${userContext.businessName}` : "";

    const systemPrompt = `You are an expert email assistant for ${userName}${businessContext}. Your job is to draft professional email replies that sound natural and human, not robotic or AI-generated.

Guidelines:
- Write in first person as if you ARE ${userName}
- Match the tone specified: ${toneDescriptions[tone] || toneDescriptions.professional}
- Keep the reply focused and actionable
- Be respectful of the sender's time
- Include a clear next step or call to action when appropriate
- Don't be overly formal or stiff - write like a real person
- If the original email has questions, address them directly
- Sign off naturally (Best, Thanks, Best regards, etc.)

${instructions ? `Additional instructions from user: ${instructions}` : ""}`;

    const userPrompt = `Draft a reply to this email:

FROM: ${originalEmail.from}
SUBJECT: ${originalEmail.subject}
CONTENT/PREVIEW: ${originalEmail.snippet}
${originalEmail.summary ? `\nAI SUMMARY: ${originalEmail.summary}` : ""}

Please draft a ${tone} reply. Return ONLY the email body text, no subject line (we'll use "Re: ${originalEmail.subject}"). Start directly with the greeting.`;

    // Call Lovable AI for drafting
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      logStep("AI drafting failed", { status: aiResponse.status, error: errorText });
      throw new Error("Failed to draft email");
    }

    const aiData = await aiResponse.json();
    const draftBody = aiData.choices[0].message.content;

    const draft: DraftResponse = {
      subject: `Re: ${originalEmail.subject}`,
      body: draftBody.trim(),
      tone,
      originalEmailId: originalEmail.id,
    };

    logStep("Draft created successfully", { bodyLength: draft.body.length });

    return new Response(
      JSON.stringify({ draft }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
