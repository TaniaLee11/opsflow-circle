import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Token endpoints for each provider
const TOKEN_CONFIGS: Record<string, {
  tokenUrl: string;
}> = {
  google: {
    tokenUrl: "https://oauth2.googleapis.com/token",
  },
  microsoft: {
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
  },
  quickbooks: {
    tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
  },
  slack: {
    tokenUrl: "https://slack.com/api/oauth.v2.access",
  },
  hubspot: {
    tokenUrl: "https://api.hubapi.com/oauth/v1/token",
  },
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[OAUTH-CALLBACK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get callback params
    const { code, state, provider } = await req.json();
    if (!code || !provider) throw new Error("Missing required parameters");
    logStep("Callback params", { provider, hasCode: !!code });

    const config = TOKEN_CONFIGS[provider];
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Verify state if stored
    if (state) {
      const { data: stateData } = await supabaseClient
        .from("oauth_states")
        .select("*")
        .eq("state", state)
        .eq("user_id", user.id)
        .single();

      if (!stateData) {
        logStep("State verification failed - proceeding anyway");
      } else {
        // Clean up used state
        await supabaseClient
          .from("oauth_states")
          .delete()
          .eq("state", state);
      }
    }

    // Get credentials from integration_configs table
    const { data: integrationConfig, error: configError } = await supabaseClient
      .from("integration_configs")
      .select("client_id, client_secret")
      .eq("provider", provider)
      .maybeSingle();

    if (configError) {
      logStep("Error fetching integration config", { error: configError.message });
      throw new Error("Failed to retrieve integration configuration");
    }

    if (!integrationConfig || !integrationConfig.client_id || !integrationConfig.client_secret) {
      throw new Error(`${provider} credentials not configured by platform owner`);
    }

    // Build redirect URI
    const siteUrl = Deno.env.get("SITE_URL") || "https://dnntsdncmptuxctbcjsp.lovableproject.com";
    const redirectUri = `${siteUrl}/integrations/callback`;

    // Exchange code for tokens
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: integrationConfig.client_id,
      client_secret: integrationConfig.client_secret,
    });

    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      logStep("Token exchange failed", { status: tokenResponse.status, error: errorText });
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokens = await tokenResponse.json();
    logStep("Tokens received", { hasAccessToken: !!tokens.access_token });

    // Get user's organization
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error("User organization not found");
    }

    // Store integration in database
    const { error: insertError } = await supabaseClient
      .from("integrations")
      .upsert({
        org_id: profile.organization_id,
        user_id: user.id,
        provider,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scopes: tokens.scope,
        connected_account: tokens.email || tokens.team?.name || provider,
        health: "ok",
        last_synced_at: new Date().toISOString(),
      }, {
        onConflict: "org_id,user_id,provider",
      });

    if (insertError) {
      logStep("Failed to store integration", { error: insertError.message });
      throw new Error("Failed to store integration");
    }

    logStep("Integration stored successfully");

    return new Response(
      JSON.stringify({ success: true, provider }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
