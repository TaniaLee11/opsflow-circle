/**
 * One-time migration function to encrypt existing plaintext OAuth tokens and client secrets
 * This should be run once after deploying the encryption changes
 * 
 * IMPORTANT: This function uses service role key and should only be called
 * by administrators. It will encrypt all plaintext tokens in the integrations table
 * and client_secret values in the integration_configs table.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { encryptToken, isEncrypted } from "../_shared/token-encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  // Never log token values
  console.log(`[MIGRATE-TOKENS] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Migration started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller is authenticated and has appropriate permissions
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is platform owner
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "platform_owner" && profile?.role !== "owner") {
      return new Response(
        JSON.stringify({ error: "Only platform owners can run migrations" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User authorized for migration", { userId: user.id, role: profile.role });

    // --- Migrate integration tokens ---
    const { data: integrations, error: fetchError } = await serviceClient
      .from("integrations")
      .select("id, access_token, refresh_token");

    if (fetchError) {
      throw new Error(`Failed to fetch integrations: ${fetchError.message}`);
    }

    let tokensMigrated = 0;
    let tokensSkipped = 0;
    let tokensErrors = 0;

    if (integrations && integrations.length > 0) {
      logStep("Found integrations", { count: integrations.length });

      for (const integration of integrations) {
        try {
          const updates: Record<string, string> = {};
          
          if (integration.access_token && !isEncrypted(integration.access_token)) {
            updates.access_token = await encryptToken(integration.access_token);
          }
          
          if (integration.refresh_token && !isEncrypted(integration.refresh_token)) {
            updates.refresh_token = await encryptToken(integration.refresh_token);
          }

          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await serviceClient
              .from("integrations")
              .update(updates)
              .eq("id", integration.id);

            if (updateError) {
              logStep("Failed to update integration", { id: integration.id, error: updateError.message });
              tokensErrors++;
            } else {
              tokensMigrated++;
            }
          } else {
            tokensSkipped++;
          }
        } catch (encryptError) {
          logStep("Encryption error for integration", { id: integration.id, error: String(encryptError) });
          tokensErrors++;
        }
      }
    }

    // --- Migrate integration_configs client_secret ---
    const { data: configs, error: configFetchError } = await serviceClient
      .from("integration_configs")
      .select("id, client_secret, provider");

    if (configFetchError) {
      throw new Error(`Failed to fetch integration_configs: ${configFetchError.message}`);
    }

    let configsMigrated = 0;
    let configsSkipped = 0;
    let configsErrors = 0;

    if (configs && configs.length > 0) {
      logStep("Found integration configs", { count: configs.length });

      for (const config of configs) {
        try {
          // Skip if already encrypted or uses env: prefix
          if (!config.client_secret || 
              isEncrypted(config.client_secret) || 
              config.client_secret.startsWith("env:")) {
            configsSkipped++;
            continue;
          }

          const encryptedSecret = await encryptToken(config.client_secret);
          
          const { error: updateError } = await serviceClient
            .from("integration_configs")
            .update({ client_secret: encryptedSecret })
            .eq("id", config.id);

          if (updateError) {
            logStep("Failed to update config", { provider: config.provider, error: updateError.message });
            configsErrors++;
          } else {
            configsMigrated++;
            logStep("Encrypted client_secret", { provider: config.provider });
          }
        } catch (encryptError) {
          logStep("Encryption error for config", { provider: config.provider, error: String(encryptError) });
          configsErrors++;
        }
      }
    }

    logStep("Migration complete", { 
      tokens: { migrated: tokensMigrated, skipped: tokensSkipped, errors: tokensErrors },
      configs: { migrated: configsMigrated, skipped: configsSkipped, errors: configsErrors }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Token and config migration complete",
        tokens: { migrated: tokensMigrated, skipped: tokensSkipped, errors: tokensErrors },
        configs: { migrated: configsMigrated, skipped: configsSkipped, errors: configsErrors },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
