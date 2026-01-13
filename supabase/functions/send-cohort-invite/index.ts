import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'COHORT-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the user is authenticated and is an owner
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Not authenticated");
    }

    // Check if user is an owner
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role, organization_id")
      .eq("user_id", user.id)
      .single();

    if (profileError || profile?.role !== "owner") {
      throw new Error("Only owners can send cohort invites");
    }

    const { email } = await req.json();
    
    if (!email || !email.includes("@")) {
      throw new Error("Valid email is required");
    }

    // Generate unique invite code
    const inviteCode = generateInviteCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days to accept

    // Create invite record using service role (bypasses RLS)
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("cohort_invites")
      .insert({
        invite_code: inviteCode,
        email: email.toLowerCase(),
        invited_by: user.id,
        organization_id: profile.organization_id,
        expires_at: expiresAt.toISOString(),
        status: "pending"
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Invite creation error:", inviteError);
      throw new Error("Failed to create invite");
    }

    // Build the invite link
    const origin = req.headers.get("origin") || "https://your-app.lovable.app";
    const inviteLink = `${origin}/auth?invite=${inviteCode}`;

    // Send email using Supabase Auth (built-in email)
    // For production, you'd use a proper email service like Resend
    // For now, we'll return the link to be displayed to the owner
    
    console.log(`Cohort invite created for ${email}: ${inviteLink}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        invite: {
          id: invite.id,
          email: email,
          inviteCode: inviteCode,
          inviteLink: inviteLink,
          expiresAt: expiresAt.toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});