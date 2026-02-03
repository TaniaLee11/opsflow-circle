import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map UI tier IDs to database-valid subscription_tier values
// Database constraint: AI_FREE, AI_ASSISTANT, AI_OPERATIONS, AI_COHORT, AI_OPERATIONS_FULL
const mapTierToDbSubscriptionTier = (tierId: string, isCohortUser: boolean): string => {
  // Cohort users get special "AI_COHORT" tier (mimics AI Operations but time-limited)
  if (isCohortUser) {
    return "AI_COHORT";
  }
  const mapping: Record<string, string> = {
    free: "AI_FREE",
    ai_assistant: "AI_ASSISTANT",
    ai_operations: "AI_OPERATIONS",
    ai_enterprise: "AI_OPERATIONS_FULL",
    ai_advisory: "AI_OPERATIONS",
    ai_tax: "AI_OPERATIONS",
    ai_compliance: "AI_OPERATIONS",
  };
  return mapping[tierId] || "AI_FREE";
};

// Map UI tier to account_type enum values
// The accounts.type column uses account_type enum which matches UI tier IDs
// Cohort users use "ai_operations" account type since they get AI Operations capabilities
const mapTierToAccountType = (tierId: string, isCohortUser: boolean): string => {
  // Cohort users get ai_operations type (they get AI Operations capabilities)
  if (isCohortUser) {
    return "ai_operations";
  }
  // These must match the account_type enum in the database
  const validAccountTypes = ["free", "ai_assistant", "ai_operations", "ai_enterprise", "ai_advisory", "ai_tax", "ai_compliance"];
  return validAccountTypes.includes(tierId) ? tierId : "free";
};

interface OnboardingPayload {
  organizationName: string;
  contactName: string;
  email: string;
  phone?: string;
  location?: string;
  industry?: string;
  selectedTier: string;
  operatingIdentity: string;
  organizationType: string;
  isCohortUser?: boolean;
  cohortInviteCode?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[onboard-create-org-account] Starting onboarding flow");

    // Get auth token from request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("[onboard-create-org-account] No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - no auth header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create auth client to validate user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    // Validate user via JWT claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await authClient.auth.getUser(token);
    
    if (claimsError || !claims.user) {
      console.error("[onboard-create-org-account] Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.user.id;
    const userEmail = claims.user.email;
    console.log("[onboard-create-org-account] Authenticated user:", userId);

    // Parse request body
    const payload: OnboardingPayload = await req.json();
    console.log("[onboard-create-org-account] Payload received:", {
      organizationName: payload.organizationName,
      selectedTier: payload.selectedTier,
      isCohortUser: payload.isCohortUser,
    });

    // Create service role client for DB writes (bypasses RLS)
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // ==== STEP A: Create Organization ====
    console.log("[onboard-create-org-account] Step A: Creating organization");
    const dbSubscriptionTier = mapTierToDbSubscriptionTier(payload.selectedTier, payload.isCohortUser || false);
    console.log("[onboard-create-org-account] Subscription tier:", dbSubscriptionTier);
    console.log("[onboard-create-org-account] Is cohort user:", payload.isCohortUser);
    
    const { data: organization, error: orgError } = await serviceClient
      .from("organizations")
      .insert({
        name: payload.organizationName || `${payload.contactName}'s Organization`,
        subscription_tier: dbSubscriptionTier,
        // For cohort users, set cohort expiry
        cohort_expires_at: payload.isCohortUser 
          ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() 
          : null,
      })
      .select()
      .single();

    if (orgError) {
      console.error("[onboard-create-org-account] Organization insert failed:", orgError.message);
      console.error("[onboard-create-org-account] Full error:", JSON.stringify(orgError));
      return new Response(
        JSON.stringify({ error: `Failed to create organization: ${orgError.message}`, table: "organizations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("[onboard-create-org-account] Organization created:", organization.id);

    // ==== STEP B: Create Account ====
    console.log("[onboard-create-org-account] Step B: Creating account");
    const accountType = mapTierToAccountType(payload.selectedTier, payload.isCohortUser || false);
    
    const { data: account, error: accountError } = await serviceClient
      .from("accounts")
      .insert({
        name: payload.organizationName || payload.contactName,
        company_name: payload.organizationName,
        phone: payload.phone || null,
        industry: payload.industry || null,
        type: accountType,
        // Cohort users get "cohort" tier, not the selectedTier from UI
        subscription_tier: payload.isCohortUser ? "cohort" : payload.selectedTier,
        address: payload.location ? { location: payload.location } : null,
        settings: {
          operatingIdentity: payload.operatingIdentity,
          organizationType: payload.organizationType,
          isCohortAccount: payload.isCohortUser || false,
        },
      })
      .select()
      .single();

    if (accountError) {
      console.error("[onboard-create-org-account] Account insert failed:", accountError.message);
      console.error("[onboard-create-org-account] Full error:", JSON.stringify(accountError));
      // Rollback: delete organization
      await serviceClient.from("organizations").delete().eq("id", organization.id);
      return new Response(
        JSON.stringify({ error: `Failed to create account: ${accountError.message}`, table: "accounts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("[onboard-create-org-account] Account created:", account.id);

    // ==== STEP C: Create Account Membership ====
    console.log("[onboard-create-org-account] Step C: Creating account membership");
    const { data: membership, error: membershipError } = await serviceClient
      .from("account_memberships")
      .insert({
        user_id: userId,
        account_id: account.id,
        role: "primary", // Owner-level access for the account
        status: "active",
      })
      .select()
      .single();

    if (membershipError) {
      console.error("[onboard-create-org-account] Membership insert failed:", membershipError.message);
      console.error("[onboard-create-org-account] Full error:", JSON.stringify(membershipError));
      // Rollback: delete account and organization
      await serviceClient.from("accounts").delete().eq("id", account.id);
      await serviceClient.from("organizations").delete().eq("id", organization.id);
      return new Response(
        JSON.stringify({ error: `Failed to create membership: ${membershipError.message}`, table: "account_memberships" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("[onboard-create-org-account] Membership created:", membership.id);

    // ==== STEP D: Update Profile ====
    console.log("[onboard-create-org-account] Step D: Updating profile");
    const { error: profileError } = await serviceClient
      .from("profiles")
      .update({
        organization_id: organization.id,
        primary_account_id: account.id,
        // Cohort users get "cohort" as their tier
        selected_tier: payload.isCohortUser ? "cohort" : payload.selectedTier,
        tier_selected: true,
        // Cohort is pre-confirmed (no payment needed), free is also pre-confirmed
        subscription_confirmed: payload.selectedTier === "free" || payload.isCohortUser,
        // Cohort gets "cohort" tier which grants AI Operations-like access for 60 days
        subscription_tier: payload.isCohortUser ? "cohort" : (payload.selectedTier === "free" ? payload.selectedTier : null),
        display_name: payload.contactName || null,
      })
      .eq("user_id", userId);

    if (profileError) {
      console.error("[onboard-create-org-account] Profile update failed:", profileError.message);
      console.error("[onboard-create-org-account] Full error:", JSON.stringify(profileError));
      // Don't rollback - the core entities were created successfully
      // Profile update can be retried
      return new Response(
        JSON.stringify({ 
          error: `Failed to update profile: ${profileError.message}`, 
          table: "profiles",
          partialSuccess: true,
          organization_id: organization.id,
          account_id: account.id,
          membership_id: membership.id,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("[onboard-create-org-account] Profile updated for user:", userId);

    // ==== STEP E: Handle Cohort Membership (if applicable) ====
    if (payload.isCohortUser) {
      console.log("[onboard-create-org-account] Step E: Creating cohort membership");
      const { error: cohortError } = await serviceClient
        .from("cohort_memberships")
        .insert({
          user_id: userId,
          organization_id: organization.id,
          status: "active",
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (cohortError) {
        console.warn("[onboard-create-org-account] Cohort membership insert failed (non-critical):", cohortError.message);
        // Non-critical - don't fail the whole operation
      } else {
        console.log("[onboard-create-org-account] Cohort membership created");
      }
    }

    // ==== SUCCESS ====
    console.log("[onboard-create-org-account] Onboarding completed successfully");
    return new Response(
      JSON.stringify({
        success: true,
        organization_id: organization.id,
        account_id: account.id,
        membership_id: membership.id,
        profile_updated: true,
        isCohortUser: payload.isCohortUser || false,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[onboard-create-org-account] Unexpected error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
