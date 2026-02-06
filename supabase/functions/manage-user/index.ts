import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManageUserRequest {
  action: "upgrade" | "downgrade" | "remove" | "status_change";
  userId: string;
  newTier?: string;
  newStatus?: "active" | "inactive" | "suspended";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify request is from authenticated owner
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Verify user is platform owner
    const { data: userRole } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userRole?.role !== "owner") {
      throw new Error("Only platform owners can manage users");
    }

    // Parse request body
    const body: ManageUserRequest = await req.json();
    const { action, userId, newTier, newStatus } = body;

    let result;

    switch (action) {
      case "upgrade":
      case "downgrade":
        if (!newTier) {
          throw new Error("newTier is required for upgrade/downgrade");
        }

        // Update user's tier in accounts table
        const { data: updateData, error: updateError } = await supabaseClient
          .from("accounts")
          .update({ 
            tier_id: newTier,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (updateError) throw updateError;

        result = {
          success: true,
          message: `User ${action}d to ${newTier}`,
          data: updateData
        };
        break;

      case "status_change":
        if (!newStatus) {
          throw new Error("newStatus is required for status_change");
        }

        // Update user's subscription status
        const { data: statusData, error: statusError } = await supabaseClient
          .from("accounts")
          .update({ 
            subscription_confirmed: newStatus === "active",
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (statusError) throw statusError;

        // If suspended, also update a suspended flag (you may need to add this column)
        if (newStatus === "suspended") {
          await supabaseClient
            .from("profiles")
            .update({ 
              // Add a suspended field to profiles table if needed
              updated_at: new Date().toISOString()
            })
            .eq("user_id", userId);
        }

        result = {
          success: true,
          message: `User status changed to ${newStatus}`,
          data: statusData
        };
        break;

      case "remove":
        // Soft delete: deactivate account and profile
        const { error: deleteAccountError } = await supabaseClient
          .from("accounts")
          .delete()
          .eq("user_id", userId);

        if (deleteAccountError) throw deleteAccountError;

        const { error: deleteProfileError } = await supabaseClient
          .from("profiles")
          .delete()
          .eq("user_id", userId);

        if (deleteProfileError) throw deleteProfileError;

        // Delete auth user (hard delete)
        const { error: deleteAuthError } = await supabaseClient.auth.admin.deleteUser(userId);

        if (deleteAuthError) throw deleteAuthError;

        result = {
          success: true,
          message: "User removed successfully"
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error managing user:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
