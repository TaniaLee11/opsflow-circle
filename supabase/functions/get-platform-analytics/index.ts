import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service_role key for full access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user is the owner
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is owner
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, selected_tier")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.email !== "tania@virtualopsassist.com") {
      return new Response(
        JSON.stringify({ error: "Forbidden - Owner access only" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch aggregated analytics data
    const [profilesRes, conversationsRes, messagesRes, integrationsRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("selected_tier, subscription_tier, subscription_confirmed"),
      supabaseAdmin.from("conversations").select("id", { count: "exact" }),
      supabaseAdmin.from("messages").select("id", { count: "exact" }),
      supabaseAdmin.from("integrations").select("id", { count: "exact" }),
    ]);

    const profiles = profilesRes.data || [];
    const totalUsers = profiles.length;
    const activeUsers = profiles.filter(p => p.subscription_confirmed).length;
    const totalConversations = conversationsRes.count || 0;
    const totalMessages = messagesRes.count || 0;
    const totalIntegrations = integrationsRes.count || 0;

    // Tier prices
    const TIER_PRICES: Record<string, number> = {
      free: 0,
      ai_assistant: 34.99,
      ai_operations: 99.99,
      ai_enterprise: 499,
      ai_advisory: 199,
      ai_tax: 149,
      ai_compliance: 179.99,
      cohort: 0,
      owner: 0,
    };

    // Build tier breakdown
    const tierBreakdown = Object.keys(TIER_PRICES).map(tierId => {
      const tierProfiles = profiles.filter(
        p => (p.subscription_tier || p.selected_tier || "free") === tierId
      );
      const tierUserCount = tierProfiles.length;
      const tierActiveUsers = tierProfiles.filter(p => p.subscription_confirmed).length;
      const tierMrr = tierActiveUsers * (TIER_PRICES[tierId] || 0);
      const activationRate = tierUserCount > 0 
        ? Math.round((tierActiveUsers / tierUserCount) * 100) 
        : 0;

      return {
        tierId,
        userCount: tierUserCount,
        activeUsers: tierActiveUsers,
        mrr: tierMrr,
        conversationCount: 0,
        messageCount: 0,
        integrationCount: 0,
        activationRate,
        engagementScore: 0,
      };
    });

    const totalMrr = tierBreakdown.reduce((sum, t) => sum + t.mrr, 0);

    const analytics = {
      totalUsers,
      activeUsers,
      totalMrr,
      totalConversations,
      totalMessages,
      totalIntegrations,
      tierBreakdown,
    };

    return new Response(
      JSON.stringify(analytics),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
