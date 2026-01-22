/**
 * Calendar Fetch - OAuth-Only Architecture
 * 
 * SECURITY MANDATE: This function ONLY accesses calendars via user-authenticated OAuth.
 * - NO system keys
 * - Every user must authenticate their own Google/Microsoft account
 * - Credentials come from integration_configs ONLY
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decryptToken, encryptToken, isEncrypted } from "../_shared/token-encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  attendees?: string[];
  isAllDay: boolean;
  status: 'confirmed' | 'tentative' | 'cancelled';
  organizer?: string;
  meetingLink?: string;
}

interface CalendarData {
  provider: string;
  connectedAccount: string;
  events: CalendarEvent[];
  upcomingCount: number;
  todayCount: number;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails) {
    delete safeDetails.access_token;
    delete safeDetails.refresh_token;
  }
  console.log(`[CALENDAR-FETCH] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
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
): Promise<string | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      logStep("Failed to refresh Google token", { status: response.status });
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    logStep("Error refreshing Google token", { error: String(error) });
    return null;
  }
}

// Fetch Google Calendar events
async function fetchGoogleCalendar(
  accessToken: string, 
  refreshToken: string | null, 
  supabase: any, 
  integrationId: string,
  credentials: { clientId: string; clientSecret: string } | null
): Promise<CalendarEvent[]> {
  let token = accessToken;
  
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const timeMin = now.toISOString();
  const timeMax = weekFromNow.toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${encodeURIComponent(timeMin)}&` +
    `timeMax=${encodeURIComponent(timeMax)}&` +
    `singleEvents=true&` +
    `orderBy=startTime&` +
    `maxResults=50`;

  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // If token expired, try to refresh
  if (response.status === 401 && refreshToken && credentials) {
    logStep("Access token expired, attempting refresh...");
    const newToken = await refreshGoogleToken(
      refreshToken, 
      credentials.clientId, 
      credentials.clientSecret
    );
    
    if (newToken) {
      token = newToken;
      const encryptedToken = await encryptToken(token);
      await supabase
        .from("integrations")
        .update({ access_token: encryptedToken, last_synced_at: new Date().toISOString() })
        .eq("id", integrationId);
      logStep("Token refreshed and encrypted");
      
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  }

  if (!response.ok) {
    throw new Error(`Google Calendar API error: ${response.status}`);
  }

  const data = await response.json();
  const events: CalendarEvent[] = [];

  for (const item of data.items || []) {
    if (item.status === 'cancelled') continue;

    const isAllDay = !!item.start?.date;
    const start = item.start?.dateTime || item.start?.date;
    const end = item.end?.dateTime || item.end?.date;

    let meetingLink = item.hangoutLink || null;
    if (!meetingLink && item.conferenceData?.entryPoints) {
      const videoEntry = item.conferenceData.entryPoints.find((e: { entryPointType: string; uri: string }) => e.entryPointType === 'video');
      meetingLink = videoEntry?.uri || null;
    }

    events.push({
      id: item.id,
      title: item.summary || '(No title)',
      start,
      end,
      location: item.location,
      description: item.description?.substring(0, 200),
      attendees: item.attendees?.map((a: { email: string }) => a.email).filter(Boolean) || [],
      isAllDay,
      status: item.status === 'tentative' ? 'tentative' : 'confirmed',
      organizer: item.organizer?.email,
      meetingLink,
    });
  }

  return events;
}

// Fetch Microsoft Outlook Calendar events
async function fetchOutlookCalendar(accessToken: string): Promise<CalendarEvent[]> {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const url = `https://graph.microsoft.com/v1.0/me/calendarView?` +
    `startDateTime=${encodeURIComponent(now.toISOString())}&` +
    `endDateTime=${encodeURIComponent(weekFromNow.toISOString())}&` +
    `$top=50&` +
    `$orderby=start/dateTime`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Outlook Calendar API error: ${response.status}`);
  }

  const data = await response.json();
  const events: CalendarEvent[] = [];

  for (const item of data.value || []) {
    if (item.isCancelled) continue;

    const isAllDay = item.isAllDay || false;
    
    let meetingLink = item.onlineMeetingUrl || null;
    if (!meetingLink && item.onlineMeeting?.joinUrl) {
      meetingLink = item.onlineMeeting.joinUrl;
    }

    events.push({
      id: item.id,
      title: item.subject || '(No title)',
      start: item.start?.dateTime ? new Date(item.start.dateTime + 'Z').toISOString() : item.start?.dateTime,
      end: item.end?.dateTime ? new Date(item.end.dateTime + 'Z').toISOString() : item.end?.dateTime,
      location: item.location?.displayName,
      description: item.bodyPreview?.substring(0, 200),
      attendees: item.attendees?.map((a: { emailAddress: { address: string } }) => a.emailAddress?.address).filter(Boolean) || [],
      isAllDay,
      status: item.showAs === 'tentative' ? 'tentative' : 'confirmed',
      organizer: item.organizer?.emailAddress?.address,
      meetingLink,
    });
  }

  return events;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting calendar fetch - OAuth-only mode");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ connected: false, error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ connected: false, error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User authenticated", { userId: user.id });

    // Get user's profile to find org_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    const orgId = profile?.organization_id;

    if (!orgId) {
      return new Response(
        JSON.stringify({ 
          connected: false, 
          message: "No organization found. Please complete onboarding first." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for calendar integrations (Google or Microsoft)
    const { data: integrations } = await supabase
      .from("integrations")
      .select("*")
      .eq("org_id", orgId)
      .in("provider", ["google", "microsoft"]);

    if (!integrations || integrations.length === 0) {
      return new Response(
        JSON.stringify({ 
          connected: false, 
          message: "No calendar connected. Connect Google or Microsoft 365 in Integrations." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const integration = integrations[0];
    const provider = integration.provider;
    const connectedAccount = integration.connected_account || user.email || "Connected Account";

    // Decrypt tokens
    const accessToken = integration.access_token ? await decryptToken(integration.access_token) : null;
    const refreshToken = integration.refresh_token ? await decryptToken(integration.refresh_token) : null;

    logStep("Found integration", { provider, hasAccessToken: !!accessToken });

    if (!accessToken) {
      return new Response(
        JSON.stringify({ 
          connected: false, 
          error: "Calendar token expired. Please reconnect your account in Integrations." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get credentials from integration_configs for token refresh
    const credentials = await getOAuthCredentials(supabase, provider);

    // Fetch calendar events
    let events: CalendarEvent[] = [];
    
    if (provider === "google") {
      events = await fetchGoogleCalendar(accessToken, refreshToken, supabase, integration.id, credentials);
    } else if (provider === "microsoft") {
      events = await fetchOutlookCalendar(accessToken);
    }

    // Count today's events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = events.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate >= today && eventDate < tomorrow;
    }).length;

    const calendarData: CalendarData = {
      provider: provider === "google" ? "Google Calendar" : "Outlook Calendar",
      connectedAccount,
      events,
      upcomingCount: events.length,
      todayCount,
    };

    // Update last_synced_at
    await supabase
      .from("integrations")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", integration.id);

    logStep("Fetched calendar events", { count: events.length, userId: user.id });

    return new Response(
      JSON.stringify({ connected: true, data: calendarData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("Calendar fetch error", { error: String(error) });
    return new Response(
      JSON.stringify({ 
        connected: false, 
        error: error instanceof Error ? error.message : "Failed to fetch calendar" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
