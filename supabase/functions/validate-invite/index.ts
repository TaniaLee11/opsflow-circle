import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { inviteCode } = await req.json();

    if (!inviteCode) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invite code is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Look up invite using admin client (bypasses RLS)
    const { data: invite, error } = await supabaseAdmin
      .from("cohort_invites")
      .select("email, invite_code, status, expires_at")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (error) {
      console.error("Error fetching invite:", error);
      return new Response(
        JSON.stringify({ valid: false, error: "Failed to validate invite" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!invite) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid invite code" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (invite.status === "accepted") {
      return new Response(
        JSON.stringify({ valid: false, error: "This invite has already been used" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (new Date(invite.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: "This invite has expired" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Valid invite
    return new Response(
      JSON.stringify({
        valid: true,
        email: invite.email,
        inviteCode: invite.invite_code,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ valid: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
