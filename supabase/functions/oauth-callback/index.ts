import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Token endpoints for each provider
const TOKEN_CONFIGS: Record<string, {
  tokenUrl: string;
  usesBasicAuth?: boolean;
  customParams?: (code: string, clientId: string, clientSecret: string, redirectUri: string) => Record<string, string>;
}> = {
  google: {
    tokenUrl: "https://oauth2.googleapis.com/token",
  },
  microsoft: {
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
  },
  quickbooks: {
    tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    usesBasicAuth: true,
  },
  slack: {
    tokenUrl: "https://slack.com/api/oauth.v2.access",
  },
  hubspot: {
    tokenUrl: "https://api.hubapi.com/oauth/v1/token",
  },
  stripe: {
    tokenUrl: "https://connect.stripe.com/oauth/token",
  },
  dropbox: {
    tokenUrl: "https://api.dropboxapi.com/oauth2/token",
  },
  xero: {
    tokenUrl: "https://identity.xero.com/connect/token",
    usesBasicAuth: true,
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

    // Get callback params
    const { code, state, provider } = await req.json();
    if (!code || !provider) throw new Error("Missing required parameters");
    logStep("Callback params", { provider, hasCode: !!code });

    const config = TOKEN_CONFIGS[provider];
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Get user from stored state - this is the secure method
    // The state was stored with user_id when oauth-start was called
    let userId: string | null = null;
    
    if (state) {
      const { data: stateData, error: stateError } = await supabaseClient
        .from("oauth_states")
        .select("user_id, expires_at")
        .eq("state", state)
        .maybeSingle();

      if (stateError) {
        logStep("State lookup error", { error: stateError.message });
      }

      if (stateData) {
        // Check if state has expired
        if (new Date(stateData.expires_at) < new Date()) {
          logStep("State expired", { expiresAt: stateData.expires_at });
          // Clean up expired state
          await supabaseClient.from("oauth_states").delete().eq("state", state);
          throw new Error("OAuth state expired - please try connecting again");
        }
        
        userId = stateData.user_id;
        logStep("User found from state", { userId });
        
        // Clean up used state
        await supabaseClient
          .from("oauth_states")
          .delete()
          .eq("state", state);
      } else {
        logStep("State not found in database", { state });
      }
    }

    // Fallback: try auth header if state didn't have user
    if (!userId) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "");
        const { data: { user } } = await anonClient.auth.getUser(token);
        if (user) {
          userId = user.id;
          logStep("User from auth header", { userId });
        }
      }
    }

    if (!userId) {
      throw new Error("OAuth state expired or invalid - please log in and try connecting again");
    }

    // Get credentials from integration_configs table or fall back to env
    const { data: integrationConfig } = await supabaseClient
      .from("integration_configs")
      .select("client_id, client_secret")
      .eq("provider", provider)
      .maybeSingle();

    // Helper to resolve credentials - supports env: prefix or direct values
    const resolveCredential = (value: string | null | undefined, envKey: string): string => {
      if (!value) return Deno.env.get(envKey) || "";
      if (value.startsWith("env:")) {
        const envName = value.replace("env:", "");
        return Deno.env.get(envName) || "";
      }
      return value;
    };

    // Use configured credentials or fall back to environment variables
    const clientId = resolveCredential(integrationConfig?.client_id, `${provider.toUpperCase()}_CLIENT_ID`);
    const clientSecret = resolveCredential(integrationConfig?.client_secret, `${provider.toUpperCase()}_CLIENT_SECRET`);

    if (!clientId || !clientSecret) {
      logStep("No credentials available", { provider });
      throw new Error(`OAuth credentials not configured for ${provider}`);
    }
    logStep("Credentials loaded", { fromConfig: !!integrationConfig?.client_id });

    // Build redirect URI (must match the redirect_uri used during oauth-start)
    const origin =
      req.headers.get("origin") ||
      Deno.env.get("SITE_URL") ||
      "https://dnntsdncmptuxctbcjsp.lovableproject.com";
    const redirectUri = `${origin}/integrations/callback`;

    // Build token request
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    // Some providers prefer client credentials in body, others via Basic auth
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (config.usesBasicAuth) {
      headers["Authorization"] = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    } else {
      tokenParams.set("client_id", clientId);
      tokenParams.set("client_secret", clientSecret);
    }

    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers,
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      logStep("Token exchange failed", { status: tokenResponse.status, error: errorText });
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokens = await tokenResponse.json();
    logStep("Tokens received", { hasAccessToken: !!tokens.access_token });

    // Get user's organization (optional - platform owners may not have one)
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", userId)
      .single();

    // For platform owners without org, use their user_id as a pseudo-org identifier
    // For regular users, require an organization
    let orgId = profile?.organization_id;
    
    if (!orgId) {
      // Check if user is a platform owner (they can operate without an org)
      const isPlatformOwner = profile?.role === 'platform_owner' || profile?.role === 'owner';
      
      if (!isPlatformOwner) {
        throw new Error("User organization not found - please complete onboarding first");
      }
      
      // For platform owners, we'll use their user_id as org_id
      // First check if there's a default org for this user, or create a virtual reference
      logStep("Platform owner without org - using user_id as org reference", { userId });
      orgId = userId; // Use user_id as fallback org_id for platform owners
    }

    // Store integration in database
    const { error: insertError } = await supabaseClient
      .from("integrations")
      .upsert({
        org_id: orgId,
        user_id: userId,
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
      throw new Error("Failed to store integration: " + insertError.message);
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
