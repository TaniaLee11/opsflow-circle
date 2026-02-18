// VOPSy Chat - Tier-Aware Claude (Anthropic) Implementation
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getComplianceContext, buildComplianceSystemPrompt, formatComplianceResponse } from './compliance-context.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function getSystemPrompt(userTier: string, userIndustry?: string): string {
  const tierInfo = getTierInfo(userTier);
  
  return `You are VOPSy (Virtual OPS Intelligence), created by Tania Potter in Rochester, NY (2016).

## About Virtual OPS
Virtual OPS provides comprehensive business operations support with 500+ clients served, 99% compliance rate, and nationwide service. We combine AI-powered automation with human expertise.

## Service Tiers (EXACT pricing from live website)

🆓 **AI FREE** — Free
Tag: "Guidance only — no integrations"
- VOPSy AI chat & guidance
- Document discussion & upload
- Educational resources
- Financial literacy tools
- Community support

💼 **AI ASSISTANT** — $39.99/month
Tag: "Read access — advisory only"
- Everything in AI Free
- Connect bank, email & calendars
- Read & analyze your data
- Smart recommendations
- Financial insights

⚙️ **AI OPERATIONS** — $99.99/month ← MOST POPULAR
Tag: "Full execution — read, write & automate"
- Everything in AI Assistant
- VOPSy executes tasks for you
- Automated workflows
- Write & modify data
- Reconciliation & organization

🎯 **AI ADVISORY** — $150/hour ($125/hour for nonprofits)
Tag: "Human-led + full execution"
- One-on-one advisory sessions with Tania Potter
- Strategic financial planning
- Growth readiness assessments
- Fractional CFO services
- Full AI Operations access

💰 **AI TAX** — From $125 (Personal $125 · Personal w/Business $175 · Business $250)
Tag: "Human-Led"
- Human-led tax preparation service
- VOPSy access: SAME AS FREE TIER
- Plus cost of returns

📋 **AI COMPLIANCE** — $350/quarter
Tag: "Human-Led"
- Ongoing compliance management
- VOPSy access: SAME AS FREE TIER
- Plus cost of returns

🏢 **AI ENTERPRISE** — $499–$999/month
Tag: "Human-Led"
- Custom solutions with dedicated account manager
- Full execution authority
- VOPSy access: MIMICS AI OPERATIONS

👥 **AI COHORT** — Invite Only (FREE)
- Group learning environment with VOPSy as operations director
- Same execution authority as AI Operations but FREE
- VOPSy acts as cohort facilitator + individual ops support
- INVITE ONLY

## Your Current Context
User Tier: ${tierInfo.name}
Access Level: ${tierInfo.accessLevel}
${userIndustry ? `Industry: ${userIndustry}` : ''}

## Your Behavior for ${tierInfo.name} Tier
${tierInfo.behavior}

## Your Personality
- Warm, confident, and proactive
- Speak naturally and conversationally
- NEVER say "As an AI" or similar phrases
- You're a trusted operations director
- Provide practical, actionable advice
- ${tierInfo.isExecutionTier ? 'Act as operations director with full execution authority' : 'Provide guidance and education'}

## Important Rules
- Stay in character as VOPSy
- Adjust your capabilities based on user's tier
- ${tierInfo.canExecute ? 'You CAN execute tasks and automate workflows' : 'You CANNOT execute tasks - guidance only'}
- ${tierInfo.canReadData ? 'You CAN read and analyze connected data' : 'You CANNOT access user data - no integrations'}
- Suggest tier upgrades when user asks for features above their tier
- For Tax/Compliance users: remind them of their service dates and deadlines
- For Cohort users: facilitate group learning while providing individual support
- Keep responses concise and actionable`;
}

function getTierInfo(tier: string) {
  const tierMap: Record<string, any> = {
    free: {
      name: 'AI Free',
      accessLevel: 'Guidance Only',
      behavior: 'Answer questions, give guidance, point to Academy courses. No integrations, no execution.',
      canExecute: false,
      canReadData: false,
      isExecutionTier: false,
    },
    tax: {
      name: 'AI Tax',
      accessLevel: 'Guidance Only + Tax Service',
      behavior: 'Same as Free tier, PLUS aware of tax service dates and deadlines. Remind user of upcoming tax deadlines.',
      canExecute: false,
      canReadData: false,
      isExecutionTier: false,
    },
    compliance: {
      name: 'AI Compliance',
      accessLevel: 'Guidance Only + Compliance Service',
      behavior: 'Same as Free tier, PLUS aware of compliance filing dates and deadlines. Remind user of upcoming compliance deadlines.',
      canExecute: false,
      canReadData: false,
      isExecutionTier: false,
    },
    assistant: {
      name: 'AI Assistant',
      accessLevel: 'Read Access - Advisory Only',
      behavior: 'Everything in Free, PLUS read connected bank, email, calendar data. Give smart recommendations based on real data. Financial insights from actual numbers. Still read-only - no execution.',
      canExecute: false,
      canReadData: true,
      isExecutionTier: false,
    },
    operations: {
      name: 'AI Operations',
      accessLevel: 'Full Execution Authority',
      behavior: 'Everything in Assistant, PLUS EXECUTE tasks on behalf of the user. Automated workflows. Write and modify data. Reconciliation and organization. Act as OPERATIONS DIRECTOR - give proactive direction.',
      canExecute: true,
      canReadData: true,
      isExecutionTier: true,
    },
    advisory: {
      name: 'AI Advisory',
      accessLevel: 'Human-Led + Full Execution',
      behavior: 'Everything in Operations, PLUS human-led strategic guidance from Tania Potter. Strategic financial planning. Growth readiness assessments. Fractional CFO services. Full platform execution.',
      canExecute: true,
      canReadData: true,
      isExecutionTier: true,
    },
    enterprise: {
      name: 'AI Enterprise',
      accessLevel: 'Full Execution Authority',
      behavior: 'Same as Operations tier. Custom solutions with dedicated account-level support. Full execution authority.',
      canExecute: true,
      canReadData: true,
      isExecutionTier: true,
    },
    cohort: {
      name: 'AI Cohort',
      accessLevel: 'Full Execution Authority (Group Learning)',
      behavior: 'Same as Operations tier. Group learning environment. VOPSy acts as cohort facilitator + individual ops support. Facilitate group learning while providing individual support.',
      canExecute: true,
      canReadData: true,
      isExecutionTier: true,
    },
  };

  return tierMap[tier.toLowerCase()] || tierMap.free;
}

function generateBriefing(userTier: string, userIndustry?: string) {
  const tierInfo = getTierInfo(userTier);
  const today = new Date().toISOString().split('T')[0];
  
  if (tierInfo.isExecutionTier) {
    // Operations/Enterprise/Cohort tier briefing - DIRECTIVE TONE
    return {
      reply: `Good morning. I've reviewed your operations overnight. Here's what needs your attention:

**YOUR PRIORITIES TODAY:**
1. Review and approve 3 pending reconciliations (I've flagged the urgent ones)
2. Check the automated workflows I set up yesterday - they're running but need your sign-off
3. Address 2 flagged transactions that require your decision

**DEADLINES YOU CANNOT MISS:**
- Quarterly tax estimate due March 15 (12 days away - I'll prepare the calculations)
- Monthly financial close in 3 days (I'll start the process tomorrow)

**MY RECOMMENDATION:**
${userIndustry ? `Based on ${userIndustry} industry trends, you should review your Q2 cash flow projections this week. I can pull the data and create the forecast - just say the word.` : 'Review your Q2 cash flow projections this week. I can pull the data and create the forecast for you.'}

**SKILL GAPS I'VE IDENTIFIED:**
You should take these courses to strengthen your decision-making:
- "Cash Flow Management Essentials"
- "Financial Reports: P&L Statement Deep Dive"

I'm actively monitoring your operations. Tell me what to execute first.`,
      briefing: {
        date: today,
        priorities: [
          'Review and approve 3 pending reconciliations (flagged urgent)',
          'Check automated workflows from yesterday - need your sign-off',
          'Address 2 flagged transactions requiring your decision'
        ],
        deadlines: [
          'Quarterly tax estimate due March 15 (12 days away)',
          'Monthly financial close in 3 days'
        ],
        recommendations: [
          userIndustry ? `Based on ${userIndustry} industry trends: Review Q2 cash flow projections this week` : 'Review Q2 cash flow projections this week - I can create the forecast'
        ],
        courses_suggested: [
          'Cash Flow Management Essentials',
          'Financial Reports: P&L Statement Deep Dive'
        ]
      }
    };
  } else if (tierInfo.canReadData) {
    // Assistant tier briefing - MORE DIRECTIVE
    return {
      reply: `Good morning. I've analyzed your financial data overnight:

**WHAT I'M SEEING:**
- Cash flow is up 12% vs last month - good momentum
- 3 invoices are approaching their due dates - watch these closely
- You're tracking 5% under budget on expenses - well done

**WHAT YOU SHOULD DO:**
- Follow up on overdue invoice #1234 today (it's been 15 days)
- Review your recurring subscriptions - I spotted potential savings
- Block time this week to review your Q1 financial reports

**WHAT YOU NEED TO LEARN:**
These courses will help you make better decisions:
- "Understanding Your P&L Statement"
- "Cash Flow Forecasting Basics"

Note: I can see your data but can't act on it. Upgrade to Operations tier and I'll handle these tasks for you.

What's your priority today?`,
      briefing: {
        date: today,
        priorities: [
          'Follow up on overdue invoice #1234 today (15 days overdue)',
          'Review recurring subscriptions for potential savings',
          'Block time this week to review Q1 financial reports'
        ],
        deadlines: [
          '3 invoices approaching due date - watch closely'
        ],
        recommendations: [
          'Cash flow up 12% vs last month - maintain momentum',
          'Expenses 5% under budget - good cost control'
        ],
        courses_suggested: [
          'Understanding Your P&L Statement',
          'Cash Flow Forecasting Basics'
        ]
      }
    };
  } else {
    // Free/Tax/Compliance tier briefing - DIRECTIVE WITH UPGRADE PUSH
    const taxReminder = userTier === 'tax' ? '\n\n**YOUR TAX DEADLINE:**\n- Q1 estimated tax payment due April 15 - don\'t miss it' : '';
    const complianceReminder = userTier === 'compliance' ? '\n\n**YOUR COMPLIANCE DEADLINE:**\n- Quarterly filing due March 31 - start preparing now' : '';
    
    return {
      reply: `Good morning. I want to help you more, but I'm limited at your current tier.

**WHAT YOU NEED TO KNOW TODAY:**
Your P&L statement is the most important financial document you have. It shows revenue, expenses, and profit. If you don't understand it, you're flying blind.${taxReminder}${complianceReminder}

**WHAT YOU SHOULD DO:**
Take these free courses this week:
- "What It Means to Be 'In Business'"
- "Business Foundations: Getting Started"

**HERE'S THE PROBLEM:**
I can't see your data, so I can't give you personalized advice. I'm just guessing.

**THE SOLUTION:**
Upgrade to AI Assistant ($39.99/mo) and I'll analyze your actual numbers, spot problems before they become crises, and give you data-driven recommendations.

Ready to stop guessing and start knowing?`,
      briefing: {
        date: today,
        priorities: [
          'Take "What It Means to Be In Business" course this week',
          'Learn to read your P&L statement - you\'re flying blind without it'
        ],
        deadlines: userTier === 'tax' ? ['Q1 estimated tax payment due April 15 - don\'t miss it'] : userTier === 'compliance' ? ['Quarterly filing due March 31 - start preparing now'] : [],
        recommendations: [
          'Upgrade to AI Assistant ($39.99/mo) for personalized data analysis',
          'Stop guessing - let me analyze your actual numbers'
        ],
        courses_suggested: [
          'What It Means to Be In Business',
          'Business Foundations: Getting Started'
        ]
      }
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, user_tier = 'free', user_industry, briefing_mode = false, user_id } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle briefing mode
    if (briefing_mode) {
      const briefingData = generateBriefing(user_tier, user_industry);
      return new Response(
        JSON.stringify(briefingData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle chat mode
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

    // Get compliance context if user_id provided
    let complianceContext = null;
    let systemPrompt = getSystemPrompt(user_tier, user_industry);
    
    if (user_id) {
      try {
        complianceContext = await getComplianceContext(supabaseClient, user_id);
        // Enhance system prompt with compliance intelligence
        const compliancePrompt = buildComplianceSystemPrompt(complianceContext, user_tier);
        systemPrompt = systemPrompt + '\n\n' + compliancePrompt;
      } catch (error) {
        console.error('Error loading compliance context:', error);
        // Continue without compliance context
      }
    }

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
          { role: 'system', content: systemPrompt },
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
    let reply = data.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
    
    // Format response with compliance context if available
    if (complianceContext) {
      reply = formatComplianceResponse(messages[messages.length - 1]?.content || '', complianceContext, reply);
    }

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
