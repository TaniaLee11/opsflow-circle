/**
 * OAuth Callback - OAuth-Only Architecture
 * 
 * SECURITY MANDATE: This function handles OAuth callbacks for ALL integrations.
 * - NO fallback to environment variables for OAuth credentials
 * - ALL credentials MUST come from integration_configs table
 * - Tokens are encrypted before storage
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { encryptToken, decryptToken, isEncrypted } from "../_shared/token-encryption.ts";

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
  zoom: {
    tokenUrl: "https://zoom.us/oauth/token",
    usesBasicAuth: true,
  },
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  // Never log token values
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails) {
    delete safeDetails.access_token;
    delete safeDetails.refresh_token;
  }
  const detailsStr = safeDetails ? ` - ${JSON.stringify(safeDetails)}` : '';
  console.log(`[OAUTH-CALLBACK] ${step}${detailsStr}`);
};

/**
 * Resolve credential from integration_configs ONLY
 * NEVER falls back to environment variables
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

    // Get callback params
    // realmId is passed for QuickBooks (company identifier)
    const { code, state, provider, realmId } = await req.json();
    if (!code || !provider) throw new Error("Missing required parameters");
    logStep("Callback params", { provider, hasCode: !!code, hasRealmId: !!realmId });

    const config = TOKEN_CONFIGS[provider];
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Get user from stored state - this is the secure method
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

    // Get credentials from integration_configs table ONLY
    // NO fallback to environment variables
    const { data: integrationConfig } = await supabaseClient
      .from("integration_configs")
      .select("client_id, client_secret, enabled")
      .eq("provider", provider)
      .maybeSingle();

    if (!integrationConfig) {
      logStep("No integration config found", { provider });
      throw new Error(`${provider} OAuth not configured. Please contact the administrator.`);
    }

    if (!integrationConfig.enabled) {
      throw new Error(`${provider} integration is currently disabled.`);
    }

    // Resolve credentials from integration_configs
    const clientId = await resolveCredential(integrationConfig.client_id);
    const clientSecret = await resolveCredential(integrationConfig.client_secret);

    if (!clientId || !clientSecret) {
      logStep("No credentials available", { provider });
      throw new Error(`${provider} OAuth credentials not configured. Please contact the administrator.`);
    }
    
    logStep("Credentials loaded from integration_configs", { provider });

    // Build redirect URI (must match the redirect_uri used during oauth-start)
    // IMPORTANT: Prefer SITE_URL for stability across preview/published environments.
    const origin = "https://opsflow-circle.lovable.app";
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

    // Encrypt tokens before storing
    const encryptedAccessToken = tokens.access_token ? await encryptToken(tokens.access_token) : null;
    const encryptedRefreshToken = tokens.refresh_token ? await encryptToken(tokens.refresh_token) : null;
    logStep("Tokens encrypted for storage");

    // Get user's organization (optional - platform owners may not have one)
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", userId)
      .single();

    let orgId = profile?.organization_id;
    
    if (!orgId) {
      // Check if user is a platform owner (they can operate without an org)
      const isPlatformOwner = profile?.role === 'platform_owner' || profile?.role === 'owner';
      
      if (!isPlatformOwner) {
        throw new Error("User organization not found - please complete onboarding first");
      }
      
      // For platform owners, we'll use their user_id as org_id
      logStep("Platform owner without org - using user_id as org reference", { userId });
      orgId = userId;
    }

    // For QuickBooks, realmId is the company identifier - store in scopes field
    // realmId comes from URL param (passed by frontend), not from token response
    const scopeValue = provider === 'quickbooks' && realmId 
      ? realmId 
      : (tokens.scope || null);
    
    logStep("Storing integration", { provider, hasRealmId: !!realmId, scopeValue });

    // Store integration in database with encrypted tokens
    const { error: insertError } = await supabaseClient
      .from("integrations")
      .upsert({
        org_id: orgId,
        user_id: userId,
        provider,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        scopes: scopeValue,
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

    logStep("Integration stored successfully with encrypted tokens");

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
