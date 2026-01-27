/**
 * Send Email - OAuth-Only Architecture
 * 
 * SECURITY MANDATE: This function ONLY sends email via user-authenticated OAuth.
 * - NO system keys
 * - Every user must authenticate their own Google/Microsoft account
 * - Credentials come from integration_configs ONLY
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { decryptToken, encryptToken, isEncrypted } from "../_shared/token-encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  originalEmailId?: string;  // Optional for new emails
  subject: string;
  body: string;
  to?: string;           // Single recipient
  bcc?: string[];        // BCC recipients for batch sends
  isNewEmail?: boolean;  // True for compose (not reply)
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails) {
    delete safeDetails.access_token;
    delete safeDetails.refresh_token;
    delete safeDetails.body;
  }
  console.log(`[SEND-EMAIL] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
};

/**
 * Get OAuth credentials from integration_configs ONLY
 */
async function getOAuthCredentials(
  supabase: any,
  provider: string
): Promise<{ clientId: string; clientSecret: string } | null> {
  const { data: config } = await supabase
    .from("integration_configs")
    .select("client_id, client_secret")
    .eq("provider", provider)
    .maybeSingle();

  if (!config?.client_id || !config?.client_secret) {
    logStep(`${provider} OAuth credentials not configured`);
    return null;
  }

  let clientId = config.client_id as string;
  let clientSecret = config.client_secret as string;

  if (clientId.startsWith("env:")) {
    clientId = Deno.env.get(clientId.replace("env:", "")) || "";
  } else if (isEncrypted(clientId)) {
    clientId = await decryptToken(clientId);
  }

  if (clientSecret.startsWith("env:")) {
    clientSecret = Deno.env.get(clientSecret.replace("env:", "")) || "";
  } else if (isEncrypted(clientSecret)) {
    clientSecret = await decryptToken(clientSecret);
  }

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

/**
 * Refresh Google access token using credentials from integration_configs
 */
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
    logStep("Google token refresh failed", { status: response.status });
    throw new Error("Failed to refresh Google access token");
  }

  const tokens = await response.json();
  return tokens.access_token;
}

/**
 * Refresh Microsoft access token using credentials from integration_configs
 */
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
    logStep("Microsoft token refresh failed", { status: response.status });
    throw new Error("Failed to refresh Microsoft access token");
  }

  const tokens = await response.json();
  return tokens.access_token;
}

// Send new email via Gmail API (with BCC support)
async function sendGmailNewEmail(
  accessToken: string,
  to: string | undefined,
  bcc: string[] | undefined,
  subject: string,
  body: string
): Promise<SendResult> {
  // Build RFC 2822 message with BCC
  const messageLines = [];
  if (to) {
    messageLines.push(`To: ${to}`);
  }
  if (bcc && bcc.length > 0) {
    messageLines.push(`Bcc: ${bcc.join(', ')}`);
  }
  messageLines.push(`Subject: ${subject}`);
  messageLines.push('Content-Type: text/html; charset=utf-8');
  messageLines.push('');
  messageLines.push(body);

  const message = messageLines.join('\r\n');

  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const sendResponse = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    }
  );

  if (!sendResponse.ok) {
    const error = await sendResponse.text();
    logStep("Gmail send failed", { error });
    return { success: false, error: "Failed to send email" };
  }

  const result = await sendResponse.json();
  return { success: true, messageId: result.id };
}

// Send email via Gmail API (reply to existing thread)
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

  if (!originalResponse.ok) {
    return { success: false, error: "Failed to get original message" };
  }

  const originalData = await originalResponse.json();
  const threadId = originalData.threadId;

  // Build RFC 2822 message
  const headers = originalData.payload?.headers || [];
  const originalMessageIdHeader = headers.find((h: any) => h.name === 'Message-ID')?.value || '';
  const references = headers.find((h: any) => h.name === 'References')?.value || '';

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `In-Reply-To: ${originalMessageIdHeader}`,
    `References: ${references} ${originalMessageIdHeader}`.trim(),
    'Content-Type: text/html; charset=utf-8',
    '',
    body,
  ].join('\r\n');

  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const sendResponse = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
        threadId,
      }),
    }
  );

  if (!sendResponse.ok) {
    const error = await sendResponse.text();
    logStep("Gmail send failed", { error });
    return { success: false, error: "Failed to send email" };
  }

  const result = await sendResponse.json();
  return { success: true, messageId: result.id };
}

// Send new email via Outlook API (with BCC support)
async function sendOutlookNewEmail(
  accessToken: string,
  to: string | undefined,
  bcc: string[] | undefined,
  subject: string,
  body: string
): Promise<SendResult> {
  const message: any = {
    subject,
    body: {
      contentType: 'HTML',
      content: body,
    },
  };

  if (to) {
    message.toRecipients = [{ emailAddress: { address: to } }];
  }

  if (bcc && bcc.length > 0) {
    message.bccRecipients = bcc.map(email => ({ emailAddress: { address: email } }));
  }

  const sendResponse = await fetch(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!sendResponse.ok) {
    const error = await sendResponse.text();
    logStep("Outlook send failed", { error });
    return { success: false, error: "Failed to send email" };
  }

  return { success: true };
}

// Send email via Outlook API (reply to existing thread)
async function sendOutlookReply(
  accessToken: string,
  originalMessageId: string,
  to: string,
  subject: string,
  body: string
): Promise<SendResult> {
  // Try to reply to the original message
  const replyResponse = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${originalMessageId}/reply`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          body: {
            contentType: 'HTML',
            content: body,
          },
        },
      }),
    }
  );

  if (replyResponse.ok) {
    return { success: true };
  }

  // Fallback: send as new message
  const sendResponse = await fetch(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject,
          body: {
            contentType: 'HTML',
            content: body,
          },
          toRecipients: [
            {
              emailAddress: { address: to },
            },
          ],
        },
      }),
    }
  );

  if (!sendResponse.ok) {
    const error = await sendResponse.text();
    logStep("Outlook send failed", { error });
    return { success: false, error: "Failed to send email" };
  }

  return { success: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started - OAuth-only mode");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User authenticated", { userId: user.id });

    const { originalEmailId, subject, body, to, bcc, isNewEmail }: SendEmailRequest = await req.json();

    // Validate required fields based on mode
    if (!subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: subject, body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Must have either to, bcc, or originalEmailId for reply
    if (!to && (!bcc || bcc.length === 0) && !originalEmailId) {
      return new Response(
        JSON.stringify({ error: "Must specify to, bcc, or originalEmailId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Send request received", { 
      to, 
      bccCount: bcc?.length || 0, 
      isNewEmail: isNewEmail || false,
      subjectLength: subject.length 
    });

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

    // Decrypt tokens
    const decryptedAccessToken = integration.access_token ? await decryptToken(integration.access_token) : null;
    const decryptedRefreshToken = integration.refresh_token ? await decryptToken(integration.refresh_token) : null;

    // Get OAuth credentials from integration_configs ONLY
    const credentials = await getOAuthCredentials(serviceClient, integration.provider);

    if (!credentials) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `${integration.provider} OAuth not configured. Please contact the administrator.`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = decryptedAccessToken;

    // Refresh token if possible
    if (decryptedRefreshToken) {
      try {
        if (integration.provider === "google") {
          accessToken = await refreshGoogleToken(
            decryptedRefreshToken, 
            credentials.clientId, 
            credentials.clientSecret
          );
        } else if (integration.provider === "microsoft") {
          accessToken = await refreshMicrosoftToken(
            decryptedRefreshToken, 
            credentials.clientId, 
            credentials.clientSecret
          );
        }
        
        // Encrypt and update stored access token
        const encryptedAccessToken = await encryptToken(accessToken!);
        await serviceClient
          .from("integrations")
          .update({ access_token: encryptedAccessToken, last_synced_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("provider", integration.provider);
          
        logStep("Token refreshed and encrypted successfully");
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

    // Determine if this is a new email or a reply
    const shouldSendNewEmail = isNewEmail || !originalEmailId || (bcc && bcc.length > 0);

    if (shouldSendNewEmail) {
      // New email with optional BCC (batch send)
      if (integration.provider === "google") {
        result = await sendGmailNewEmail(accessToken, to, bcc, subject, body);
      } else if (integration.provider === "microsoft") {
        result = await sendOutlookNewEmail(accessToken, to, bcc, subject, body);
      } else {
        result = { success: false, error: "Unsupported email provider" };
      }
    } else {
      // Reply to existing thread
      if (integration.provider === "google") {
        result = await sendGmailReply(accessToken, originalEmailId!, to!, subject, body);
      } else if (integration.provider === "microsoft") {
        result = await sendOutlookReply(accessToken, originalEmailId!, to!, subject, body);
      } else {
        result = { success: false, error: "Unsupported email provider" };
      }
    }

    if (result.success) {
      logStep("Email sent successfully", { 
        provider: integration.provider, 
        messageId: result.messageId,
        isBatch: bcc && bcc.length > 0 
      });
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
