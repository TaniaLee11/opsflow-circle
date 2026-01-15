import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActionRequest {
  action: 'create_task' | 'update_task' | 'create_project' | 'update_project' | 'create_calendar_event' | 'update_calendar_event';
  data: Record<string, any>;
}

// Refresh Google access token
async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!clientId || !clientSecret) return null;

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

  if (response.status === 401 && refreshToken) {
    const newToken = await refreshGoogleToken(refreshToken);
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
  eventId: string,
  updates: { title?: string; start?: string; end?: string; description?: string; location?: string }
): Promise<{ success: boolean; error?: string }> {
  let token = accessToken;

  // First get the existing event
  let getResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (getResponse.status === 401 && refreshToken) {
    const newToken = await refreshGoogleToken(refreshToken);
    if (newToken) {
      token = newToken;
      getResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  }

  if (!getResponse.ok) {
    return { success: false, error: "Event not found" };
  }

  const existingEvent = await getResponse.json();

  // Merge updates
  const updatedEvent = {
    ...existingEvent,
    summary: updates.title || existingEvent.summary,
    description: updates.description !== undefined ? updates.description : existingEvent.description,
    location: updates.location !== undefined ? updates.location : existingEvent.location,
    start: updates.start ? { dateTime: updates.start, timeZone: 'America/New_York' } : existingEvent.start,
    end: updates.end ? { dateTime: updates.end, timeZone: 'America/New_York' } : existingEvent.end,
  };

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEvent),
  });

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
      timeZone: 'Eastern Standard Time',
    },
    end: {
      dateTime: event.end,
      timeZone: 'Eastern Standard Time',
    },
    location: event.location ? { displayName: event.location } : undefined,
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
    return { success: false, error: "Failed to create calendar event" };
  }

  const result = await response.json();
  return { success: true, eventId: result.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
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
        JSON.stringify({ success: false, error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, data }: ActionRequest = await req.json();

    // Get user profile for org_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    const orgId = profile?.organization_id;

    let result: any;

    switch (action) {
      case 'create_task': {
        const { title, description, priority, due_date, project_id, status } = data;
        
        const { data: task, error } = await supabase
          .from("tasks")
          .insert({
            user_id: user.id,
            organization_id: orgId,
            title,
            description,
            priority: priority || 'medium',
            status: status || 'pending',
            due_date: due_date ? new Date(due_date).toISOString() : null,
            project_id: project_id || null,
          })
          .select()
          .single();

        if (error) {
          console.error("Create task error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        result = { success: true, task, message: `Task "${title}" created successfully!` };
        break;
      }

      case 'update_task': {
        const { task_id, ...updates } = data;
        
        if (!task_id) {
          return new Response(
            JSON.stringify({ success: false, error: "Task ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Handle status change to completed
        if (updates.status === 'completed') {
          updates.completed_at = new Date().toISOString();
        }

        const { data: task, error } = await supabase
          .from("tasks")
          .update(updates)
          .eq("id", task_id)
          .select()
          .single();

        if (error) {
          console.error("Update task error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        result = { success: true, task, message: `Task updated successfully!` };
        break;
      }

      case 'create_project': {
        const { name, description, due_date, status } = data;
        
        const { data: project, error } = await supabase
          .from("projects")
          .insert({
            user_id: user.id,
            organization_id: orgId,
            name,
            description,
            status: status || 'active',
            due_date: due_date ? new Date(due_date).toISOString() : null,
          })
          .select()
          .single();

        if (error) {
          console.error("Create project error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        result = { success: true, project, message: `Project "${name}" created successfully!` };
        break;
      }

      case 'update_project': {
        const { project_id, ...updates } = data;
        
        if (!project_id) {
          return new Response(
            JSON.stringify({ success: false, error: "Project ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: project, error } = await supabase
          .from("projects")
          .update(updates)
          .eq("id", project_id)
          .select()
          .single();

        if (error) {
          console.error("Update project error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        result = { success: true, project, message: `Project updated successfully!` };
        break;
      }

      case 'create_calendar_event': {
        const { title, start, end, description, location } = data;

        // Get calendar integration
        const { data: integrations } = await supabase
          .from("integrations")
          .select("*")
          .eq("org_id", orgId)
          .in("provider", ["google", "microsoft"]);

        if (!integrations || integrations.length === 0) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "No calendar connected. Please connect Google or Microsoft 365 first." 
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const integration = integrations[0];
        let calendarResult;

        if (integration.provider === "google") {
          calendarResult = await createGoogleCalendarEvent(
            integration.access_token,
            integration.refresh_token,
            { title, start, end, description, location }
          );
        } else {
          calendarResult = await createOutlookCalendarEvent(
            integration.access_token,
            { title, start, end, description, location }
          );
        }

        if (!calendarResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: calendarResult.error }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        result = { 
          success: true, 
          eventId: calendarResult.eventId, 
          message: `Calendar event "${title}" created successfully!` 
        };
        break;
      }

      case 'update_calendar_event': {
        const { event_id, title, start, end, description, location } = data;

        if (!event_id) {
          return new Response(
            JSON.stringify({ success: false, error: "Event ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get calendar integration
        const { data: integrations } = await supabase
          .from("integrations")
          .select("*")
          .eq("org_id", orgId)
          .in("provider", ["google", "microsoft"]);

        if (!integrations || integrations.length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: "No calendar connected" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const integration = integrations[0];

        if (integration.provider === "google") {
          const updateResult = await updateGoogleCalendarEvent(
            integration.access_token,
            integration.refresh_token,
            event_id,
            { title, start, end, description, location }
          );

          if (!updateResult.success) {
            return new Response(
              JSON.stringify({ success: false, error: updateResult.error }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        // TODO: Add Outlook update support

        result = { success: true, message: `Calendar event updated successfully!` };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`VOPSy action completed: ${action} for user ${user.id}`);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("VOPSy actions error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Action failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
