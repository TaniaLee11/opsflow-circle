// VOPSy Hybrid AI - Claude (real-time) + Manus (browser tasks)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `You are VOPSy (Virtual Operations Intelligence), the AI agent inside Virtual OPS Hub.

You function as an Accountant, Financial Organizer, Compliance Guide, and Operations Partner.

IMPORTANT: You have two modes of operation:

1. **Chat Mode** (your default): Answer questions, provide guidance, call APIs
2. **Browser Task Mode**: For complex visual tasks that require browser automation

When a user asks you to do something that requires:
- Navigating websites visually
- Clicking buttons in QuickBooks
- Reading visual dashboards
- Multi-step browser workflows

You should respond: "This requires browser automation. I'm creating a task for you..."
Then use the create_manus_task function.

For everything else (questions, API calls, data analysis), respond normally in chat.

Your capabilities:
- AI Operations+ tiers: Full execution (browser tasks + API calls)
- AI Assistant: Read-only API access
- AI Free: Chat guidance only

You are capable, warm, direct, and practical.`;

// Available tools for Claude
const TOOLS = [
  {
    name: "create_manus_task",
    description: "Create a browser automation task for complex visual workflows (bank reconciliation, QuickBooks navigation, etc.)",
    input_schema: {
      type: "object",
      properties: {
        task_description: {
          type: "string",
          description: "Detailed description of what needs to be done"
        },
        context: {
          type: "string",
          description: "Additional context from the conversation"
        }
      },
      required: ["task_description"]
    }
  },
  {
    name: "get_quickbooks_data",
    description: "Fetch financial data from QuickBooks via API",
    input_schema: {
      type: "object",
      properties: {
        data_type: {
          type: "string",
          enum: ["balance_sheet", "profit_loss", "cash_flow", "transactions"],
          description: "Type of financial data to retrieve"
        },
        date_range: {
          type: "string",
          description: "Date range for the data (e.g., 'last_month', 'ytd', 'custom')"
        }
      },
      required: ["data_type"]
    }
  }
];

async function createManusTask(taskDescription: string, context: string = "") {
  const fullPrompt = `${context}\n\nUser Request: ${taskDescription}`;
  
  const response = await fetch('https://api.manus.ai/v1/tasks', {
    method: 'POST',
    headers: {
      'API_KEY': Deno.env.get('MANUS_API_KEY')!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: fullPrompt,
      agentProfile: 'manus-1.6-max',
      taskMode: 'agent',
      hideInTaskList: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Manus API error: ${response.status}`);
  }

  return await response.json();
}

async function callClaudeWithTools(messages: any[]) {
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
      tools: TOOLS,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], userTier = 'ai_free' } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build conversation for Claude
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call Claude with tool use enabled
    let claudeResponse = await callClaudeWithTools(messages);
    
    // Handle tool use
    while (claudeResponse.stop_reason === 'tool_use') {
      const toolUse = claudeResponse.content.find((block: any) => block.type === 'tool_use');
      
      if (toolUse.name === 'create_manus_task') {
        // Create Manus task
        const conversationContext = conversationHistory
          .map((m: any) => `${m.role}: ${m.content}`)
          .join('\n\n');
        
        const manusTask = await createManusTask(
          toolUse.input.task_description,
          conversationContext + '\n\n' + (toolUse.input.context || '')
        );
        
        // Return task info to user
        return new Response(JSON.stringify({
          message: `I've created a browser automation task for you. You can monitor its progress here: ${manusTask.task_url}`,
          task_url: manusTask.task_url,
          task_id: manusTask.task_id,
          success: true,
          mode: 'manus_task'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (toolUse.name === 'get_quickbooks_data') {
        // TODO: Implement QuickBooks API call
        // For now, return placeholder
        const toolResult = {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: 'QuickBooks integration coming soon. Please connect your QuickBooks account first.'
        };
        
        // Continue conversation with tool result
        messages.push({
          role: 'assistant',
          content: claudeResponse.content
        });
        messages.push({
          role: 'user',
          content: [toolResult]
        });
        
        claudeResponse = await callClaudeWithTools(messages);
      }
    }

    // Extract text response
    const textContent = claudeResponse.content.find((block: any) => block.type === 'text');
    const assistantMessage = textContent ? textContent.text : 'I apologize, but I encountered an issue processing your request.';

    return new Response(JSON.stringify({
      message: assistantMessage,
      success: true,
      mode: 'claude_chat'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in vopsy-chat-hybrid function:', errorMessage);
    
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
