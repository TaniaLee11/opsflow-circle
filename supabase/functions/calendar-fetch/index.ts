import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Refresh Google access token
async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    console.error("Missing Google OAuth credentials");
    return null;
  }

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
      console.error("Failed to refresh Google token:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error refreshing Google token:", error);
    return null;
  }
}

// Fetch Google Calendar events
async function fetchGoogleCalendar(accessToken: string, refreshToken: string | null): Promise<CalendarEvent[]> {
  let token = accessToken;
  
  // Calculate time range: now to 7 days from now
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
  if (response.status === 401 && refreshToken) {
    console.log("Access token expired, attempting refresh...");
    const newToken = await refreshGoogleToken(refreshToken);
    if (newToken) {
      token = newToken;
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

    // Extract meeting link
    let meetingLink = item.hangoutLink || null;
    if (!meetingLink && item.conferenceData?.entryPoints) {
      const videoEntry = item.conferenceData.entryPoints.find((e: any) => e.entryPointType === 'video');
      meetingLink = videoEntry?.uri || null;
    }

    events.push({
      id: item.id,
      title: item.summary || '(No title)',
      start,
      end,
      location: item.location,
      description: item.description?.substring(0, 200),
      attendees: item.attendees?.map((a: any) => a.email).filter(Boolean) || [],
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
    
    // Extract meeting link
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
      attendees: item.attendees?.map((a: any) => a.emailAddress?.address).filter(Boolean) || [],
      isAllDay,
      status: item.showAs === 'tentative' ? 'tentative' : 'confirmed',
      organizer: item.organizer?.emailAddress?.address,
      meetingLink,
    });
  }

  return events;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ connected: false, error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ connected: false, error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
          message: "No calendar connected. Connect Google or Microsoft 365 to enable Calendar Intelligence." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the first available integration
    const integration = integrations[0];
    const provider = integration.provider;
    const accessToken = integration.access_token;
    const refreshToken = integration.refresh_token;
    const connectedAccount = integration.connected_account || user.email || "Connected Account";

    if (!accessToken) {
      return new Response(
        JSON.stringify({ 
          connected: false, 
          error: "Calendar token expired. Please reconnect your account." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch calendar events
    let events: CalendarEvent[] = [];
    
    if (provider === "google") {
      events = await fetchGoogleCalendar(accessToken, refreshToken);
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

    console.log(`Fetched ${events.length} calendar events for user ${user.id}`);

    return new Response(
      JSON.stringify({ connected: true, data: calendarData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Calendar fetch error:", error);
    return new Response(
      JSON.stringify({ 
        connected: false, 
        error: error instanceof Error ? error.message : "Failed to fetch calendar" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
