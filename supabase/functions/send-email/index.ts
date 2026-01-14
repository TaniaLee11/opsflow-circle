import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  originalEmailId: string;
  subject: string;
  body: string;
  to: string;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const logStep = (step: string, details?: any) => {
  console.log(`[SEND-EMAIL] ${step}`, details ? JSON.stringify(details) : '');
};

// Refresh Google access token
async function refreshGoogleToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logStep("Google token refresh failed", { error });
    throw new Error("Failed to refresh Google access token");
  }

  const tokens = await response.json();
  return tokens.access_token;
}

// Refresh Microsoft access token
async function refreshMicrosoftToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      scope: "openid profile email User.Read Mail.Read Mail.Send",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logStep("Microsoft token refresh failed", { error });
    throw new Error("Failed to refresh Microsoft access token");
  }

  const tokens = await response.json();
  return tokens.access_token;
}

// Send email via Gmail API
async function sendGmailReply(
  accessToken: string,
  originalMessageId: string,
  to: string,
  subject: string,
  body: string
): Promise<SendResult> {
  // Get the original message to extract threadId and headers
  const originalResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${originalMessageId}?format=metadata&metadataHeaders=Message-ID&metadataHeaders=References`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  let threadId = "";
  let references = "";
  let inReplyTo = "";

  if (originalResponse.ok) {
    const originalData = await originalResponse.json();
    threadId = originalData.threadId || "";
    
    const headers = originalData.payload?.headers || [];
    const messageId = headers.find((h: any) => h.name === "Message-ID")?.value || "";
    const existingRefs = headers.find((h: any) => h.name === "References")?.value || "";
    
    if (messageId) {
      inReplyTo = messageId;
      references = existingRefs ? `${existingRefs} ${messageId}` : messageId;
    }
  }

  // Build the raw email message (RFC 2822 format)
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `MIME-Version: 1.0`,
  ];

  if (inReplyTo) {
    emailLines.push(`In-Reply-To: ${inReplyTo}`);
  }
  if (references) {
    emailLines.push(`References: ${references}`);
  }

  emailLines.push("", body);

  const rawEmail = emailLines.join("\r\n");
  
  // Base64url encode the email
  const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Send the email
  const sendUrl = threadId 
    ? `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`
    : `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`;

  const requestBody: any = { raw: encodedEmail };
  if (threadId) {
    requestBody.threadId = threadId;
  }

  const sendResponse = await fetch(sendUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!sendResponse.ok) {
    const error = await sendResponse.text();
    logStep("Gmail send failed", { error, status: sendResponse.status });
    return { success: false, error: `Gmail API error: ${sendResponse.status}` };
  }

  const result = await sendResponse.json();
  logStep("Gmail email sent", { messageId: result.id });
  
  return { success: true, messageId: result.id };
}

// Send email via Microsoft Graph API
async function sendOutlookReply(
  accessToken: string,
  originalMessageId: string,
  to: string,
  subject: string,
  body: string
): Promise<SendResult> {
  // For Outlook, we can use the reply endpoint directly
  // First, try to reply to the original message
  const replyResponse = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${originalMessageId}/reply`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          body: {
            contentType: "Text",
            content: body,
          },
        },
        comment: "", // No additional comment needed
      }),
    }
  );

  // If reply endpoint works (returns 202 Accepted)
  if (replyResponse.ok || replyResponse.status === 202) {
    logStep("Outlook reply sent successfully");
    return { success: true, messageId: originalMessageId };
  }

  // If reply fails (e.g., original message not found), send as new email
  logStep("Reply endpoint failed, sending as new email", { status: replyResponse.status });
  
  const sendResponse = await fetch(
    "https://graph.microsoft.com/v1.0/me/sendMail",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: subject,
          body: {
            contentType: "Text",
            content: body,
          },
          toRecipients: [
            {
              emailAddress: {
                address: to,
              },
            },
          ],
        },
      }),
    }
  );

  if (!sendResponse.ok && sendResponse.status !== 202) {
    const error = await sendResponse.text();
    logStep("Outlook send failed", { error, status: sendResponse.status });
    return { success: false, error: `Outlook API error: ${sendResponse.status}` };
  }

  logStep("Outlook email sent as new message");
  return { success: true };
}

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

    const { originalEmailId, subject, body, to }: SendEmailRequest = await req.json();

    if (!originalEmailId || !subject || !body || !to) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: originalEmailId, subject, body, to" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Send request received", { to, subject: subject.substring(0, 50) });

    // Check for connected email integrations
    const { data: integrations, error: intError } = await serviceClient
      .from("integrations")
      .select("provider, access_token, refresh_token, connected_account, last_synced_at")
      .eq("user_id", user.id)
      .in("provider", ["google", "microsoft"]);

    if (intError) {
      logStep("Integration lookup error", { error: intError.message });
      throw new Error("Failed to check integrations");
    }

    if (!integrations || integrations.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No email account connected. Please connect Google Workspace or Microsoft 365 to send emails.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const integration = integrations[0];
    logStep("Found integration", { provider: integration.provider });

    // Get OAuth credentials for token refresh
    const { data: integrationConfig } = await serviceClient
      .from("integration_configs")
      .select("client_id, client_secret")
      .eq("provider", integration.provider)
      .maybeSingle();

    const resolveCredential = (value: string | null | undefined, envKey: string): string => {
      if (!value) return Deno.env.get(envKey) || "";
      if (value.startsWith("env:")) return Deno.env.get(value.replace("env:", "")) || "";
      return value;
    };

    const clientId = resolveCredential(integrationConfig?.client_id, `${integration.provider.toUpperCase()}_CLIENT_ID`);
    const clientSecret = resolveCredential(integrationConfig?.client_secret, `${integration.provider.toUpperCase()}_CLIENT_SECRET`);

    let accessToken = integration.access_token;

    // Refresh token if possible
    if (integration.refresh_token && clientId && clientSecret) {
      try {
        if (integration.provider === "google") {
          accessToken = await refreshGoogleToken(integration.refresh_token, clientId, clientSecret);
        } else if (integration.provider === "microsoft") {
          accessToken = await refreshMicrosoftToken(integration.refresh_token, clientId, clientSecret);
        }
        
        // Update stored access token
        await serviceClient
          .from("integrations")
          .update({ access_token: accessToken, last_synced_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("provider", integration.provider);
          
        logStep("Token refreshed successfully");
      } catch (refreshError) {
        logStep("Token refresh failed, using existing token", { error: String(refreshError) });
      }
    }

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email access token expired. Please reconnect your email account in Integrations.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send the email
    let result: SendResult;

    if (integration.provider === "google") {
      result = await sendGmailReply(accessToken, originalEmailId, to, subject, body);
    } else if (integration.provider === "microsoft") {
      result = await sendOutlookReply(accessToken, originalEmailId, to, subject, body);
    } else {
      result = { success: false, error: "Unsupported email provider" };
    }

    if (result.success) {
      logStep("Email sent successfully", { provider: integration.provider, messageId: result.messageId });
    } else {
      logStep("Email send failed", { error: result.error });
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
