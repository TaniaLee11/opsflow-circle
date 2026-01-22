/**
 * Inbox Fetch - OAuth-Only Architecture
 * 
 * SECURITY MANDATE: This function ONLY accesses email via user-authenticated OAuth.
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

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  isUnread: boolean;
  labels: string[];
}

interface InboxSummary {
  provider: string;
  connectedAccount: string;
  lastSync: string;
  emails: EmailMessage[];
  stats: {
    total: number;
    unread: number;
    flagged: number;
  };
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails) {
    delete safeDetails.access_token;
    delete safeDetails.refresh_token;
  }
  console.log(`[INBOX-FETCH] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
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
    logStep("Token refresh failed", { status: response.status });
    throw new Error("Failed to refresh access token");
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
      scope: "openid profile email User.Read Mail.Read",
    }),
  });

  if (!response.ok) {
    logStep("Microsoft token refresh failed", { status: response.status });
    throw new Error("Failed to refresh Microsoft access token");
  }

  const tokens = await response.json();
  return tokens.access_token;
}

// Fetch Gmail messages
async function fetchGmailMessages(accessToken: string, maxResults: number = 20): Promise<EmailMessage[]> {
  const listResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=is:unread OR is:starred newer_than:1d`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!listResponse.ok) {
    throw new Error(`Gmail API error: ${listResponse.status}`);
  }

  const listData = await listResponse.json();
  const messages: EmailMessage[] = [];

  for (const msg of (listData.messages || []).slice(0, maxResults)) {
    const msgResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (msgResponse.ok) {
      const msgData = await msgResponse.json();
      const headers = msgData.payload?.headers || [];
      
      const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value || '';
      
      messages.push({
        id: msg.id,
        subject: getHeader('Subject') || '(No subject)',
        from: getHeader('From'),
        snippet: msgData.snippet || '',
        date: getHeader('Date'),
        isUnread: (msgData.labelIds || []).includes('UNREAD'),
        labels: msgData.labelIds || [],
      });
    }
  }

  return messages;
}

// Fetch Outlook messages
async function fetchOutlookMessages(accessToken: string, maxResults: number = 20): Promise<EmailMessage[]> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages?$top=${maxResults}&$filter=isRead eq false or flag/flagStatus eq 'flagged'&$orderby=receivedDateTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Outlook API error: ${response.status}`);
  }

  const data = await response.json();
  const messages: EmailMessage[] = [];

  for (const msg of data.value || []) {
    const labels: string[] = [];
    if (!msg.isRead) labels.push('UNREAD');
    if (msg.flag?.flagStatus === 'flagged') labels.push('IMPORTANT');

    messages.push({
      id: msg.id,
      subject: msg.subject || '(No subject)',
      from: msg.from?.emailAddress?.address || '',
      snippet: msg.bodyPreview || '',
      date: msg.receivedDateTime,
      isUnread: !msg.isRead,
      labels,
    });
  }

  return messages;
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

    // Check for connected email integrations (Google or Microsoft)
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
          connected: false,
          message: "No email account connected. Please connect Google Workspace or Microsoft 365 in Integrations.",
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
          connected: true,
          error: `${integration.provider} OAuth not configured. Please contact the administrator.`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = decryptedAccessToken;

    // Try to refresh the token if we have refresh token and credentials
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
          connected: true,
          error: "Email access token expired. Please reconnect your email account in Integrations.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch emails based on provider
    let emails: EmailMessage[] = [];
    
    try {
      if (integration.provider === "google") {
        emails = await fetchGmailMessages(accessToken);
      } else if (integration.provider === "microsoft") {
        emails = await fetchOutlookMessages(accessToken);
      }
    } catch (fetchError) {
      logStep("Email fetch error", { error: String(fetchError) });
      return new Response(
        JSON.stringify({
          connected: true,
          error: "Failed to fetch emails. Your access may have expired. Please reconnect in Integrations.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate stats
    const stats = {
      total: emails.length,
      unread: emails.filter(e => e.isUnread).length,
      flagged: emails.filter(e => e.labels.includes('STARRED') || e.labels.includes('IMPORTANT')).length,
    };

    const summary: InboxSummary = {
      provider: integration.provider === "google" ? "Gmail" : "Outlook",
      connectedAccount: integration.connected_account || user.email || "Connected",
      lastSync: new Date().toISOString(),
      emails,
      stats,
    };

    logStep("Emails fetched successfully", { count: emails.length, stats });

    return new Response(
      JSON.stringify({ connected: true, data: summary }),
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
