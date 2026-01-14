import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  isUnread: boolean;
  labels: string[];
}

interface AnalyzedEmail {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  priority: "urgent" | "needs_response" | "fyi";
  category: string;
  summary: string;
  suggestedAction?: string;
}

interface InboxAnalysis {
  provider: string;
  connectedAccount: string;
  analyzedAt: string;
  urgent: AnalyzedEmail[];
  needsResponse: AnalyzedEmail[];
  fyi: AnalyzedEmail[];
  summary: string;
}

const logStep = (step: string, details?: any) => {
  console.log(`[INBOX-ANALYZE] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User authenticated", { userId: user.id });

    // Get emails from inbox-fetch function (or from request body if already fetched)
    const { emails, provider, connectedAccount } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(
        JSON.stringify({
          analysis: {
            provider: provider || "Email",
            connectedAccount: connectedAccount || user.email,
            analyzedAt: new Date().toISOString(),
            urgent: [],
            needsResponse: [],
            fyi: [],
            summary: "📭 **Your inbox is clear!** No unread or flagged emails from today that need attention.",
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Analyzing emails", { count: emails.length });

    // Build a prompt for AI to analyze the emails
    const emailList = emails.map((e: EmailMessage, i: number) => 
      `${i + 1}. From: ${e.from}\n   Subject: ${e.subject}\n   Preview: ${e.snippet.slice(0, 150)}...`
    ).join("\n\n");

    const analysisPrompt = `You are an executive assistant analyzing an inbox. Review these emails and categorize each one.

EMAILS TO ANALYZE:
${emailList}

For each email, respond with a JSON array where each item has:
- "index": the email number (1-based)
- "priority": one of "urgent", "needs_response", or "fyi"
  - "urgent" = deadlines, money matters, client risk, time-sensitive
  - "needs_response" = requests, approvals, scheduling, questions
  - "fyi" = newsletters, updates, notifications (no action needed)
- "category": brief category (e.g., "Client Request", "Invoice", "Meeting", "Newsletter", "Deadline")
- "summary": 1-2 sentence plain-English summary of what this email is about
- "suggestedAction": optional brief suggested next step for urgent/needs_response items

Respond ONLY with valid JSON array, no other text. Example:
[{"index": 1, "priority": "urgent", "category": "Invoice", "summary": "Client ABC sent an overdue invoice for $5,000 due yesterday.", "suggestedAction": "Review and process payment today"}]`;

    // Call Lovable AI for analysis
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert executive assistant. Analyze emails precisely and respond only with valid JSON." },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      logStep("AI analysis failed", { status: aiResponse.status, error: errorText });
      throw new Error("Failed to analyze emails");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    logStep("AI response received", { length: aiContent.length });

    // Parse the AI response
    let analysisResults: any[] = [];
    try {
      // Extract JSON from the response (handle markdown code blocks)
      let jsonStr = aiContent;
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      analysisResults = JSON.parse(jsonStr);
    } catch (parseError) {
      logStep("Failed to parse AI response", { error: String(parseError), content: aiContent.slice(0, 500) });
      // Fallback: mark all as FYI
      analysisResults = emails.map((_: any, i: number) => ({
        index: i + 1,
        priority: "fyi",
        category: "Email",
        summary: "Could not analyze this email",
      }));
    }

    // Build analyzed email objects
    const analyzedEmails: AnalyzedEmail[] = emails.map((email: EmailMessage, i: number) => {
      const analysis = analysisResults.find((a: any) => a.index === i + 1) || {
        priority: "fyi",
        category: "Email",
        summary: email.snippet.slice(0, 100),
      };

      return {
        ...email,
        priority: analysis.priority,
        category: analysis.category,
        summary: analysis.summary,
        suggestedAction: analysis.suggestedAction,
      };
    });

    // Group by priority
    const urgent = analyzedEmails.filter(e => e.priority === "urgent");
    const needsResponse = analyzedEmails.filter(e => e.priority === "needs_response");
    const fyi = analyzedEmails.filter(e => e.priority === "fyi");

    // Generate summary
    let summaryParts: string[] = [];
    if (urgent.length > 0) {
      summaryParts.push(`🔴 **${urgent.length} urgent** email${urgent.length > 1 ? 's' : ''} requiring immediate attention`);
    }
    if (needsResponse.length > 0) {
      summaryParts.push(`🟡 **${needsResponse.length}** email${needsResponse.length > 1 ? 's' : ''} needing a response`);
    }
    if (fyi.length > 0) {
      summaryParts.push(`🟢 **${fyi.length}** FYI email${fyi.length > 1 ? 's' : ''} (no action needed)`);
    }

    const overallSummary = summaryParts.length > 0 
      ? summaryParts.join('\n') 
      : "📭 Your inbox is clear!";

    const analysis: InboxAnalysis = {
      provider: provider || "Email",
      connectedAccount: connectedAccount || user.email || "Connected",
      analyzedAt: new Date().toISOString(),
      urgent,
      needsResponse,
      fyi,
      summary: overallSummary,
    };

    logStep("Analysis complete", { urgent: urgent.length, needsResponse: needsResponse.length, fyi: fyi.length });

    return new Response(
      JSON.stringify({ analysis }),
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
