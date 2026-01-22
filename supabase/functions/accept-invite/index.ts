import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * accept-invite: Marks a cohort invite as accepted after user signup
 * 
 * This function:
 * 1. Validates the invite code exists and is still valid
 * 2. Marks the invite as "accepted" with timestamp
 * 3. Returns success so the frontend can proceed with onboarding
 * 
 * Note: cohort_membership is created during onboarding (onboard-create-org-account)
 * This function just updates the invite status for tracking/audit purposes.
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[accept-invite] Processing invite acceptance");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Get auth token to identify the user
    const authHeader = req.headers.get("authorization");
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Parse request body
    const { inviteCode } = await req.json();
    console.log("[accept-invite] Invite code:", inviteCode?.substring(0, 8) + "...");

    if (!inviteCode) {
      return new Response(
        JSON.stringify({ success: false, error: "Invite code is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Look up the invite
    const { data: invite, error: fetchError } = await supabaseAdmin
      .from("cohort_invites")
      .select("id, email, status, expires_at, organization_id")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (fetchError) {
      console.error("[accept-invite] Error fetching invite:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to lookup invite" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!invite) {
      console.warn("[accept-invite] Invite not found:", inviteCode);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid invite code" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check if already accepted
    if (invite.status === "accepted") {
      console.log("[accept-invite] Invite already accepted:", invite.id);
      return new Response(
        JSON.stringify({ success: true, message: "Invite already accepted" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      console.warn("[accept-invite] Invite expired:", invite.id);
      return new Response(
        JSON.stringify({ success: false, error: "This invite has expired" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Mark invite as accepted
    const { error: updateError } = await supabaseAdmin
      .from("cohort_invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    if (updateError) {
      console.error("[accept-invite] Error updating invite:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to accept invite" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("[accept-invite] Invite accepted successfully:", invite.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invite accepted",
        organizationId: invite.organization_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[accept-invite] Unexpected error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
