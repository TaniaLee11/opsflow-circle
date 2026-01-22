/**
 * Check Subscription - Platform Billing ONLY
 * 
 * PURPOSE: Manages YOUR SaaS subscription tiers (Free, AI Assistant, AI Operations, etc.)
 * 
 * SECURITY NOTE:
 * - Uses STRIPE_SECRET_KEY for PLATFORM BILLING (your Stripe account)
 * - This is CORRECT and ALLOWED for managing user subscriptions to your platform
 * - This does NOT access user financial data or connected accounts
 * - User financial data is handled by financial-fetch via OAuth tokens
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Price ID to tier mapping
const PRICE_TO_TIER: Record<string, string> = {
  "price_1Sk4YLJ3R9oDKFd4mgxV1oiw": "free",
  "price_1Sh16AJ3R9oDKFd40hVGZlfE": "ai_assistant",
  "price_1Sh19gJ3R9oDKFd4ftPwaGcS": "ai_operations",
  "price_1Sh1TfJ3R9oDKFd4DcGU9izr": "ai_enterprise",
  "price_1Sox4DJ3R9oDKFd4uzradhaH": "ai_advisory",
  "price_1Sox4MJ3R9oDKFd4RdC2PcGv": "ai_advisory",
  "price_1Sk56qJ3R9oDKFd4xzJQi6Ch": "ai_tax",
  "price_1Sk588J3R9oDKFd47tkpsRsM": "ai_compliance",
  "price_1Sk59VJ3R9oDKFd4YXwHdTa9": "ai_tax",
};

// Product ID to tier mapping (fallback)
const PRODUCT_TO_TIER: Record<string, string> = {
  "prod_TeJjJw05IhMkRb": "ai_assistant",
  "prod_TeJnNlrcJH3XfS": "ai_operations",
  "prod_TeK75lsD5x4Pch": "ai_enterprise",
  "prod_ThTVDIyIHX9EaD": "free",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl) throw new Error("SUPABASE_URL is not set");
    if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    if (!anonKey) throw new Error("SUPABASE_ANON_KEY is not set");

    // Service-role client for DB reads/writes
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Validate JWT using signing keys (required)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = claimsData.claims.sub;
    const email = (claimsData.claims as any).email as string | undefined;
    if (!email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    logStep("User authenticated", { userId, email });

    // First check database profile for subscription status
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("subscription_confirmed, subscription_tier, selected_tier, role")
      .eq("user_id", userId)
      .single();

    // Check for active cohort membership
    const { data: cohortMembership } = await supabaseClient
      .from("cohort_memberships")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .single();

    // Platform owner always has full access
    if (profile?.role === "owner") {
      logStep("User is platform owner - full access");
      return new Response(JSON.stringify({
        subscribed: true,
        tier: "owner",
        has_access: true,
        access_type: "owner",
        subscription_end: null,
        product_id: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Cohort members have access during cohort period
    if (cohortMembership) {
      logStep("User has active cohort membership", { expiresAt: cohortMembership.expires_at });
      return new Response(JSON.stringify({
        subscribed: true,
        tier: "cohort",
        has_access: true,
        access_type: "cohort",
        subscription_end: cohortMembership.expires_at,
        product_id: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Free tier always has access
    if (profile?.selected_tier === "free") {
      logStep("User is on free tier - access granted");
      return new Response(JSON.stringify({
        subscribed: false,
        tier: "free",
        has_access: true,
        access_type: "free",
        subscription_end: null,
        product_id: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check Stripe for active subscription
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found - checking profile subscription_confirmed");
      
      // If subscription was confirmed via webhook, grant access
      if (profile?.subscription_confirmed && profile?.subscription_tier) {
        return new Response(JSON.stringify({
          subscribed: true,
          tier: profile.subscription_tier,
          has_access: true,
          access_type: "confirmed",
          subscription_end: null,
          product_id: null,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: "pending",
        has_access: false,
        access_type: "none",
        selected_tier: profile?.selected_tier || null,
        subscription_end: null,
        product_id: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep("No active Stripe subscription");
      
      // Check for confirmed one-time payments in profile
      if (profile?.subscription_confirmed && profile?.subscription_tier) {
        return new Response(JSON.stringify({
          subscribed: true,
          tier: profile.subscription_tier,
          has_access: true,
          access_type: "one_time",
          subscription_end: null,
          product_id: null,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response(JSON.stringify({
        subscribed: false,
        tier: "pending",
        has_access: false,
        access_type: "none",
        selected_tier: profile?.selected_tier || null,
        subscription_end: null,
        product_id: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price?.id;
    const productId = subscription.items.data[0]?.price?.product as string;
    const tier = PRICE_TO_TIER[priceId] || PRODUCT_TO_TIER[productId] || "unknown";
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

    logStep("Active subscription found", {
      subscriptionId: subscription.id,
      productId,
      priceId,
      tier,
      endDate: subscriptionEnd,
    });

    // Update profile with confirmed subscription status
    await supabaseClient
      .from("profiles")
      .update({
        subscription_confirmed: true,
        subscription_tier: tier,
        stripe_subscription_id: subscription.id,
      })
      .eq("user_id", userId);

    return new Response(JSON.stringify({
      subscribed: true,
      tier,
      has_access: true,
      access_type: "subscription",
      product_id: productId,
      subscription_end: subscriptionEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});