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
    scopes: ["openid", "profile", "email", "accounting.transactions", "accounting.contacts"],
  },
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[OAUTH-START] ${step}${detailsStr}`);
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

    // Get OAuth credentials from integration_configs table
    const { data: integrationConfig } = await supabaseClient
      .from("integration_configs")
      .select("client_id, client_secret")
      .eq("provider", provider)
      .maybeSingle();

    // Helper to resolve credentials - supports env: prefix, encrypted values, or direct values
    // NOTE: For QuickBooks, we NEVER fall back to environment variables - OAuth only
    const resolveCredential = async (value: string | null | undefined, envKey: string, isQuickBooks: boolean = false): Promise<string> => {
      if (!value) {
        // QuickBooks: Never fall back to env vars - require integration_configs
        if (isQuickBooks) {
          return "";
        }
        return Deno.env.get(envKey) || "";
      }
      if (value.startsWith("env:")) {
        const envName = value.replace("env:", "");
        return Deno.env.get(envName) || "";
      }
      // Check if value is encrypted and decrypt it
      if (isEncrypted(value)) {
        return await decryptToken(value);
      }
      return value;
    };

    const isQuickBooks = provider === "quickbooks";
    
    // Use configured credentials - QuickBooks requires integration_configs, no env fallback
    const clientId = await resolveCredential(
      integrationConfig?.client_id, 
      `${provider.toUpperCase()}_CLIENT_ID`,
      isQuickBooks
    );
    
    if (!clientId) {
      logStep("No client_id available", { provider });
      if (isQuickBooks) {
        throw new Error("QuickBooks OAuth not configured. Please configure QuickBooks credentials in integration_configs.");
      }
      throw new Error(`OAuth credentials not configured for ${provider}`);
    }

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
