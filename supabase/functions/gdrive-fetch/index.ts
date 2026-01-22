import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decryptToken, encryptToken } from "../_shared/token-encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink: string;
  thumbnailLink?: string;
  modifiedTime: string;
  size?: string;
  owners?: { displayName: string; emailAddress: string }[];
}

interface DriveResponse {
  connected: boolean;
  provider: string;
  connectedAccount: string;
  files: DriveFile[];
  error?: string;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails) {
    delete safeDetails.access_token;
    delete safeDetails.refresh_token;
  }
  console.log(`[GDRIVE-FETCH] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
};

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

// Fetch recent Google Drive files
// deno-lint-ignore no-explicit-any
async function fetchGoogleDriveFiles(
  accessToken: string, 
  refreshToken: string | null, 
  supabase: any, 
  integrationId: string,
  limit: number = 10
): Promise<DriveFile[]> {
  let token = accessToken;

  // Query for recent files (modified in last 30 days, not trashed)
  const query = "trashed=false";
  const fields = "files(id,name,mimeType,webViewLink,iconLink,thumbnailLink,modifiedTime,size,owners)";
  const orderBy = "modifiedTime desc";
  
  const url = `https://www.googleapis.com/drive/v3/files?` +
    `q=${encodeURIComponent(query)}&` +
    `fields=${encodeURIComponent(fields)}&` +
    `orderBy=${encodeURIComponent(orderBy)}&` +
    `pageSize=${limit}`;

  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // If token expired, try to refresh
  if (response.status === 401 && refreshToken) {
    logStep("Access token expired, attempting refresh");
    const newToken = await refreshGoogleToken(refreshToken);
    
    if (newToken) {
      token = newToken;
      // Update the stored access token
      const encryptedToken = await encryptToken(newToken);
      await supabase
        .from("integrations")
        .update({ access_token: encryptedToken })
        .eq("id", integrationId);
      
      logStep("Token refreshed successfully");
      
      // Retry with new token
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      logStep("Token refresh failed");
      return [];
    }
  }

  if (!response.ok) {
    logStep("Google Drive API error", { status: response.status });
    return [];
  }

  const data = await response.json();
  logStep("Fetched Drive files", { count: data.files?.length || 0 });

  return (data.files || []).map((file: any) => ({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    webViewLink: file.webViewLink,
    iconLink: file.iconLink,
    thumbnailLink: file.thumbnailLink,
    modifiedTime: file.modifiedTime,
    size: file.size,
    owners: file.owners,
  }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Google Drive fetch");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      logStep("Auth failed", { error: userError?.message });
      throw new Error("Unauthorized");
    }

    logStep("User authenticated", { userId: user.id });

    // Parse request body for options
    let limit = 10;
    try {
      const body = await req.json();
      if (body.limit && typeof body.limit === 'number') {
        limit = Math.min(body.limit, 50); // Cap at 50
      }
    } catch {
      // No body or invalid JSON, use defaults
    }

    // Get Google integration
    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .maybeSingle();

    if (integrationError) {
      logStep("Integration query error", { error: integrationError.message });
      throw new Error("Failed to fetch integration");
    }

    if (!integration) {
      logStep("No Google integration found");
      return new Response(
        JSON.stringify({
          connected: false,
          provider: "google",
          connectedAccount: "",
          files: [],
          error: "Google Drive not connected",
        } as DriveResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Found integration", { 
      id: integration.id, 
      connectedAccount: integration.connected_account,
      health: integration.health 
    });

    // Check if Drive scope is included
    const scopes = integration.scopes || "";
    if (!scopes.includes("drive")) {
      logStep("Drive scope not granted");
      return new Response(
        JSON.stringify({
          connected: false,
          provider: "google",
          connectedAccount: integration.connected_account,
          files: [],
          error: "Google Drive access not granted. Please reconnect with Drive permissions.",
        } as DriveResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrypt tokens
    const accessToken = await decryptToken(integration.access_token || "");
    const refreshToken = await decryptToken(integration.refresh_token || "");

    if (!accessToken) {
      logStep("No access token available");
      return new Response(
        JSON.stringify({
          connected: false,
          provider: "google",
          connectedAccount: integration.connected_account,
          files: [],
          error: "No valid access token. Please reconnect Google Drive.",
        } as DriveResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch Drive files
    const files = await fetchGoogleDriveFiles(
      accessToken, 
      refreshToken, 
      supabase, 
      integration.id,
      limit
    );

    const response: DriveResponse = {
      connected: true,
      provider: "google",
      connectedAccount: integration.connected_account || "Google Drive",
      files,
    };

    logStep("Returning Drive data", { fileCount: files.length });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("Error in gdrive-fetch", { error: String(error) });
    return new Response(
      JSON.stringify({ 
        connected: false,
        provider: "google",
        connectedAccount: "",
        files: [],
        error: error instanceof Error ? error.message : "Unknown error" 
      } as DriveResponse),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
