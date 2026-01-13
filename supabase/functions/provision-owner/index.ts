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
    // Use service role to create admin user
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const ownerEmail = "tania@virtualopsassist.com";
    const ownerPassword = "Anointed1!";

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingOwner = existingUsers?.users?.find(u => u.email === ownerEmail);

    if (existingOwner) {
      // User exists, update password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingOwner.id,
        { password: ownerPassword, email_confirm: true }
      );

      if (updateError) {
        throw new Error(`Failed to update owner: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Owner account password updated", userId: existingOwner.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create new owner user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
      user_metadata: { name: "Tania" }
    });

    if (createError) {
      throw new Error(`Failed to create owner: ${createError.message}`);
    }

    console.log("[provision-owner] Owner account created:", newUser.user?.id);

    return new Response(
      JSON.stringify({ success: true, message: "Owner account created successfully", userId: newUser.user?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[provision-owner] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
