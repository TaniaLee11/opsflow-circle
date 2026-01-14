import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

const logStep = (step: string, details?: any) => {
  console.log(`[INBOX-FETCH] ${step}`, details ? JSON.stringify(details) : '');
};

// Refresh Google access token if needed
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
    logStep("Token refresh failed", { error });
    throw new Error("Failed to refresh access token");
  }

  const tokens = await response.json();
  return tokens.access_token;
}

// Refresh Microsoft access token if needed
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
    const error = await response.text();
    logStep("Microsoft token refresh failed", { error });
    throw new Error("Failed to refresh Microsoft access token");
  }

  const tokens = await response.json();
  return tokens.access_token;
}

// Fetch Gmail messages
async function fetchGmailMessages(accessToken: string, maxResults: number = 20): Promise<EmailMessage[]> {
  // Get list of message IDs (unread or flagged from today)
  const listResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=is:unread OR is:starred newer_than:1d`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!listResponse.ok) {
    const error = await listResponse.text();
    logStep("Gmail list failed", { error, status: listResponse.status });
    throw new Error(`Gmail API error: ${listResponse.status}`);
  }

  const listData = await listResponse.json();
  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  // Fetch full details for each message (batch of IDs)
  const emails: EmailMessage[] = [];
  
  for (const msg of listData.messages.slice(0, maxResults)) {
    const msgResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (msgResponse.ok) {
      const msgData = await msgResponse.json();
      
      const headers = msgData.payload?.headers || [];
      const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value || '';
      
      emails.push({
        id: msgData.id,
        subject: getHeader('Subject') || '(No Subject)',
        from: getHeader('From'),
        snippet: msgData.snippet || '',
        date: getHeader('Date'),
        isUnread: msgData.labelIds?.includes('UNREAD') || false,
        labels: msgData.labelIds || [],
      });
    }
  }

  return emails;
}

// Fetch Microsoft Outlook messages
async function fetchOutlookMessages(accessToken: string, maxResults: number = 20): Promise<EmailMessage[]> {
  // Fetch unread or flagged messages from the last day
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const dateFilter = today.toISOString();

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages?$top=${maxResults}&$filter=isRead eq false or flag/flagStatus eq 'flagged' or receivedDateTime ge ${dateFilter}&$select=id,subject,from,bodyPreview,receivedDateTime,isRead,flag&$orderby=receivedDateTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    logStep("Outlook fetch failed", { error, status: response.status });
    throw new Error(`Outlook API error: ${response.status}`);
  }

  const data = await response.json();
  
  return (data.value || []).map((msg: any) => ({
    id: msg.id,
    subject: msg.subject || '(No Subject)',
    from: msg.from?.emailAddress?.address || msg.from?.emailAddress?.name || 'Unknown',
    snippet: msg.bodyPreview || '',
    date: msg.receivedDateTime,
    isUnread: !msg.isRead,
    labels: msg.flag?.flagStatus === 'flagged' ? ['STARRED'] : [],
  }));
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
          message: "No email account connected. Please connect Google Workspace or Microsoft 365 in the Integrations page to enable Inbox Intelligence.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the first available email integration
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

    // Try to refresh the token if we have refresh token and credentials
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
