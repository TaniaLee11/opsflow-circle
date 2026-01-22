/**
 * OAuth Start - OAuth-Only Architecture
 * 
 * SECURITY MANDATE: This function initiates OAuth flows for ALL integrations.
 * - NO fallback to environment variables for OAuth credentials
 * - ALL credentials MUST come from integration_configs table
 * - Every user must authenticate their own third-party accounts
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { decryptToken, isEncrypted } from "../_shared/token-encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// OAuth configuration for each provider
const OAUTH_CONFIGS: Record<string, {
  authUrl: string;
  scopes: string[];
  extraParams?: Record<string, string>;
}> = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scopes: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  },
  microsoft: {
    authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    scopes: [
      "openid",
      "profile",
      "email",
      "User.Read",
      "Mail.Read",
      "Calendars.Read",
      "offline_access",
    ],
  },
  quickbooks: {
    authUrl: "https://appcenter.intuit.com/connect/oauth2",
    scopes: ["com.intuit.quickbooks.accounting"],
  },
  slack: {
    authUrl: "https://slack.com/oauth/v2/authorize",
    scopes: ["channels:read", "chat:write", "users:read"],
  },
  hubspot: {
    authUrl: "https://app.hubspot.com/oauth/authorize",
    scopes: ["crm.objects.contacts.read", "crm.objects.companies.read"],
  },
  stripe: {
    // Stripe Connect OAuth - NOT platform billing
    authUrl: "https://connect.stripe.com/oauth/authorize",
    scopes: ["read_write"],
    extraParams: { response_type: "code" },
  },
  dropbox: {
    authUrl: "https://www.dropbox.com/oauth2/authorize",
    scopes: [],
    extraParams: { token_access_type: "offline" },
  },
  xero: {
    authUrl: "https://login.xero.com/identity/connect/authorize",
    scopes: ["openid", "profile", "email", "accounting.transactions", "accounting.contacts", "offline_access"],
  },
  zoom: {
    authUrl: "https://zoom.us/oauth/authorize",
    scopes: [],
    // Zoom OAuth doesn't use scope param in auth URL - scopes are configured in the Zoom App
  },
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[OAUTH-START] ${step}${detailsStr}`);
};

/**
 * Resolve credential from integration_configs ONLY
 * NEVER falls back to environment variables for user integrations
 */
async function resolveCredential(value: string | null | undefined): Promise<string> {
  if (!value) {
    return "";
  }
  // env: prefix is allowed - it references where the OAuth app credentials are stored
  if (value.startsWith("env:")) {
    const envName = value.replace("env:", "");
    return Deno.env.get(envName) || "";
  }
  // Check if value is encrypted and decrypt it
  if (isEncrypted(value)) {
    return await decryptToken(value);
  }
  return value;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started - OAuth-only mode");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get provider from request
    const { provider } = await req.json();
    if (!provider) throw new Error("Provider is required");
    logStep("Provider requested", { provider });

    const config = OAUTH_CONFIGS[provider];
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}. Supported: ${Object.keys(OAUTH_CONFIGS).join(", ")}`);
    }

    // Get OAuth credentials from integration_configs table ONLY
    // NO fallback to environment variables
    const { data: integrationConfig } = await supabaseClient
      .from("integration_configs")
      .select("client_id, client_secret, enabled")
      .eq("provider", provider)
      .maybeSingle();

    // IMPORTANT: integration_configs stores OAuth APP credentials (client_id, client_secret)
    // These are used ONLY to build the OAuth URL and exchange codes for tokens
    // This is NOT a "connection" - the user must complete OAuth to connect
    
    if (!integrationConfig) {
      logStep("No OAuth app config found", { provider });
      // This is a BUILDER/ADMIN issue, not a user error
      // Return a specific error code so frontend can handle appropriately
      throw new Error(`OAUTH_APP_NOT_CONFIGURED:${provider}`);
    }

    if (!integrationConfig.enabled) {
      logStep("OAuth app disabled", { provider });
      throw new Error(`OAUTH_APP_DISABLED:${provider}`);
    }

    // Resolve OAuth app credentials (for building auth URL only)
    const clientId = await resolveCredential(integrationConfig.client_id);
    
    if (!clientId) {
      logStep("OAuth app missing client_id", { provider });
      throw new Error(`OAUTH_APP_NOT_CONFIGURED:${provider}`);
    }

    logStep("Credentials loaded from integration_configs", { provider });

    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state in database for verification on callback
    const { error: stateError } = await supabaseClient
      .from("oauth_states")
      .insert({
        state,
        user_id: user.id,
        provider,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min expiry
      });

    if (stateError) {
      logStep("Failed to store state", { error: stateError.message });
      // Continue anyway - state verification is optional
    }

    // Build redirect URI
    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://dnntsdncmptuxctbcjsp.lovableproject.com";
    const redirectUri = `${origin}/integrations/callback`;

    // Build OAuth URL
    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      state: `${state}:${provider}`,
      access_type: "offline",
      prompt: "consent",
      ...config.extraParams,
    });

    // Add scopes
    if (config.scopes.length > 0) {
      authParams.set("scope", config.scopes.join(" "));
    }

    const oauthUrl = `${config.authUrl}?${authParams.toString()}`;
    logStep("OAuth URL generated", { provider });

    return new Response(
      JSON.stringify({ url: oauthUrl, provider }),
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
