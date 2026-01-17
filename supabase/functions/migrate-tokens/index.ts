/**
 * One-time migration function to encrypt existing plaintext OAuth tokens
 * This should be run once after deploying the encryption changes
 * 
 * IMPORTANT: This function uses service role key and should only be called
 * by administrators. It will encrypt all plaintext tokens in the integrations table.
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

    // Fetch all integrations with tokens
    const { data: integrations, error: fetchError } = await serviceClient
      .from("integrations")
      .select("id, access_token, refresh_token");

    if (fetchError) {
      throw new Error(`Failed to fetch integrations: ${fetchError.message}`);
    }

    if (!integrations || integrations.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No integrations found to migrate", migrated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Found integrations", { count: integrations.length });

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const integration of integrations) {
      try {
        const updates: Record<string, string> = {};
        
        // Check and encrypt access_token if needed
        if (integration.access_token && !isEncrypted(integration.access_token)) {
          updates.access_token = await encryptToken(integration.access_token);
        }
        
        // Check and encrypt refresh_token if needed
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
            errorCount++;
          } else {
            migratedCount++;
          }
        } else {
          skippedCount++;
        }
      } catch (encryptError) {
        logStep("Encryption error for integration", { id: integration.id, error: String(encryptError) });
        errorCount++;
      }
    }

    logStep("Migration complete", { migrated: migratedCount, skipped: skippedCount, errors: errorCount });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Token migration complete",
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errorCount,
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
