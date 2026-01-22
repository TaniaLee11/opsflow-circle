/**
 * VOPSy Actions - OAuth-Only Architecture
 * 
 * SECURITY MANDATE: This function ONLY accesses third-party services via user-authenticated OAuth.
 * - NO system keys for user data access
 * - Every user must authenticate their own accounts
 * - Credentials come from integration_configs ONLY
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decryptToken, encryptToken, isEncrypted } from "../_shared/token-encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActionRequest {
  action: 'create_task' | 'update_task' | 'create_project' | 'update_project' | 'create_calendar_event' | 'update_calendar_event';
  data: Record<string, any>;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails) {
    delete safeDetails.access_token;
    delete safeDetails.refresh_token;
  }
  console.log(`[VOPSY-ACTIONS] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
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

    if (!response.ok) return null;
    const data = await response.json();
    return data.access_token;
  } catch {
    return null;
  }
}

// Create Google Calendar event
async function createGoogleCalendarEvent(
  accessToken: string,
  refreshToken: string | null,
  credentials: { clientId: string; clientSecret: string } | null,
  event: { title: string; start: string; end: string; description?: string; location?: string }
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  let token = accessToken;

  const eventData = {
    summary: event.title,
    description: event.description || '',
    location: event.location || '',
    start: {
      dateTime: event.start,
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: event.end,
      timeZone: 'America/New_York',
    },
  };

  let response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  });

  if (response.status === 401 && refreshToken && credentials) {
    const newToken = await refreshGoogleToken(refreshToken, credentials.clientId, credentials.clientSecret);
    if (newToken) {
      token = newToken;
      response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google Calendar error:", errorText);
    return { success: false, error: "Failed to create calendar event" };
  }

  const result = await response.json();
  return { success: true, eventId: result.id };
}

// Update Google Calendar event
async function updateGoogleCalendarEvent(
  accessToken: string,
  refreshToken: string | null,
  credentials: { clientId: string; clientSecret: string } | null,
  eventId: string,
  updates: { title?: string; start?: string; end?: string; description?: string; location?: string }
): Promise<{ success: boolean; error?: string }> {
  let token = accessToken;

  // Build update payload
  const eventData: Record<string, any> = {};
  if (updates.title) eventData.summary = updates.title;
  if (updates.description) eventData.description = updates.description;
  if (updates.location) eventData.location = updates.location;
  if (updates.start) {
    eventData.start = { dateTime: updates.start, timeZone: 'America/New_York' };
  }
  if (updates.end) {
    eventData.end = { dateTime: updates.end, timeZone: 'America/New_York' };
  }

  let response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    }
  );

  if (response.status === 401 && refreshToken && credentials) {
    const newToken = await refreshGoogleToken(refreshToken, credentials.clientId, credentials.clientSecret);
    if (newToken) {
      token = newToken;
      response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        }
      );
    }
  }

  if (!response.ok) {
    return { success: false, error: "Failed to update calendar event" };
  }

  return { success: true };
}

// Create Outlook Calendar event
async function createOutlookCalendarEvent(
  accessToken: string,
  event: { title: string; start: string; end: string; description?: string; location?: string }
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const eventData = {
    subject: event.title,
    body: {
      contentType: "Text",
      content: event.description || '',
    },
    start: {
      dateTime: event.start,
      timeZone: "Eastern Standard Time",
    },
    end: {
      dateTime: event.end,
      timeZone: "Eastern Standard Time",
    },
    location: {
      displayName: event.location || '',
    },
  };

  const response = await fetch("https://graph.microsoft.com/v1.0/me/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Outlook Calendar error:", errorText);
    return { success: false, error: "Failed to create Outlook calendar event" };
  }

  const result = await response.json();
  return { success: true, eventId: result.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("VOPSy action started - OAuth-only mode");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    logStep("User authenticated", { userId: user.id });

    const { action, data }: ActionRequest = await req.json();

    if (!action || !data) {
      throw new Error("Missing action or data");
    }

    logStep("Action requested", { action });

    // Get user's organization
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    const orgId = profile?.organization_id;

    let result: any = { success: false, error: "Unknown action" };

    switch (action) {
      case 'create_task': {
        const { error: taskError } = await supabase
          .from("tasks")
          .insert({
            user_id: user.id,
            organization_id: orgId,
            title: data.title,
            description: data.description,
            priority: data.priority || 'medium',
            status: 'pending',
            due_date: data.dueDate,
          });

        if (taskError) {
          result = { success: false, error: taskError.message };
        } else {
          result = { success: true, message: "Task created successfully" };
        }
        break;
      }

      case 'update_task': {
        const updateData: Record<string, any> = {};
        if (data.title) updateData.title = data.title;
        if (data.description) updateData.description = data.description;
        if (data.priority) updateData.priority = data.priority;
        if (data.status) updateData.status = data.status;
        if (data.dueDate) updateData.due_date = data.dueDate;

        const { error: updateError } = await supabase
          .from("tasks")
          .update(updateData)
          .eq("id", data.taskId)
          .eq("user_id", user.id);

        if (updateError) {
          result = { success: false, error: updateError.message };
        } else {
          result = { success: true, message: "Task updated successfully" };
        }
        break;
      }

      case 'create_project': {
        const { error: projectError } = await supabase
          .from("projects")
          .insert({
            user_id: user.id,
            organization_id: orgId,
            name: data.name,
            description: data.description,
            status: 'active',
            due_date: data.dueDate,
          });

        if (projectError) {
          result = { success: false, error: projectError.message };
        } else {
          result = { success: true, message: "Project created successfully" };
        }
        break;
      }

      case 'update_project': {
        const updateData: Record<string, any> = {};
        if (data.name) updateData.name = data.name;
        if (data.description) updateData.description = data.description;
        if (data.status) updateData.status = data.status;
        if (data.dueDate) updateData.due_date = data.dueDate;

        const { error: updateError } = await supabase
          .from("projects")
          .update(updateData)
          .eq("id", data.projectId)
          .eq("user_id", user.id);

        if (updateError) {
          result = { success: false, error: updateError.message };
        } else {
          result = { success: true, message: "Project updated successfully" };
        }
        break;
      }

      case 'create_calendar_event': {
        // Get user's calendar integration
        const { data: integrations } = await supabase
          .from("integrations")
          .select("*")
          .eq("user_id", user.id)
          .in("provider", ["google", "microsoft"]);

        if (!integrations || integrations.length === 0) {
          result = { success: false, error: "No calendar connected. Please connect Google or Microsoft 365." };
          break;
        }

        const integration = integrations[0];
        const accessToken = integration.access_token ? await decryptToken(integration.access_token) : null;
        const refreshToken = integration.refresh_token ? await decryptToken(integration.refresh_token) : null;

        if (!accessToken) {
          result = { success: false, error: "Calendar access expired. Please reconnect." };
          break;
        }

        // Get credentials from integration_configs
        const credentials = await getOAuthCredentials(supabase, integration.provider);

        if (integration.provider === "google") {
          result = await createGoogleCalendarEvent(accessToken, refreshToken, credentials, {
            title: data.title,
            start: data.start,
            end: data.end,
            description: data.description,
            location: data.location,
          });
        } else if (integration.provider === "microsoft") {
          result = await createOutlookCalendarEvent(accessToken, {
            title: data.title,
            start: data.start,
            end: data.end,
            description: data.description,
            location: data.location,
          });
        }
        break;
      }

      case 'update_calendar_event': {
        const { data: integrations } = await supabase
          .from("integrations")
          .select("*")
          .eq("user_id", user.id)
          .in("provider", ["google", "microsoft"]);

        if (!integrations || integrations.length === 0) {
          result = { success: false, error: "No calendar connected." };
          break;
        }

        const integration = integrations[0];
        const accessToken = integration.access_token ? await decryptToken(integration.access_token) : null;
        const refreshToken = integration.refresh_token ? await decryptToken(integration.refresh_token) : null;

        if (!accessToken) {
          result = { success: false, error: "Calendar access expired. Please reconnect." };
          break;
        }

        // Get credentials from integration_configs
        const credentials = await getOAuthCredentials(supabase, integration.provider);

        if (integration.provider === "google") {
          result = await updateGoogleCalendarEvent(
            accessToken, 
            refreshToken, 
            credentials,
            data.eventId, 
            {
              title: data.title,
              start: data.start,
              end: data.end,
              description: data.description,
              location: data.location,
            }
          );
        } else {
          result = { success: false, error: "Outlook calendar update not yet supported" };
        }
        break;
      }
    }

    logStep("Action completed", { action, success: result.success });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("Error in vopsy-actions", { error: String(error) });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
