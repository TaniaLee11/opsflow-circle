/**
 * Platform Metrics Sync - Owner SaaS Analytics
 * 
 * PURPOSE: Calculates and stores platform-wide SaaS metrics for the owner
 * 
 * ACCESS: Only accessible by owner (tania@virtualopsassist.com)
 * 
 * METRICS: MRR, subscriber counts, churn, growth, revenue per tier
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
  console.log(`[PLATFORM-METRICS-SYNC] ${step}${detailsStr}`);
};

// Tier prices for MRR calculation
const TIER_PRICES: Record<string, number> = {
  free: 0,
  ai_assistant: 39.99,
  ai_operations: 99.99,
  ai_enterprise: 499,
  ai_advisory: 150,  // Per hour, but not subscription
  ai_tax: 0,  // One-time payments
  ai_compliance: 350 / 3,  // Quarterly, so monthly = 350/3
  cohort: 0,
  owner: 0,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase with service_role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify owner access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    // Check if user is owner
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.email !== "tania@virtualopsassist.com") {
      throw new Error("Forbidden - Owner access only");
    }

    logStep("Owner verified");

    // Get Stripe secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Fetch all profiles to calculate subscriber metrics
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, email, subscription_tier, subscription_confirmed, stripe_subscription_id, created_at");

    if (!profiles) throw new Error("Failed to fetch profiles");

    logStep("Profiles fetched", { count: profiles.length });

    // Calculate subscriber counts by tier
    const subscribersByTier: Record<string, number> = {};
    const revenueByTier: Record<string, number> = {};
    
    for (const tier of Object.keys(TIER_PRICES)) {
      subscribersByTier[tier] = 0;
      revenueByTier[tier] = 0;
    }

    let totalSubscribers = 0;
    let mrr = 0;

    for (const profile of profiles) {
      const tier = profile.subscription_tier || "free";
      
      if (profile.subscription_confirmed) {
        subscribersByTier[tier] = (subscribersByTier[tier] || 0) + 1;
        totalSubscribers++;
        
        const tierPrice = TIER_PRICES[tier] || 0;
        mrr += tierPrice;
        revenueByTier[tier] = (revenueByTier[tier] || 0) + tierPrice;
      }
    }

    logStep("Subscriber metrics calculated", { totalSubscribers, mrr });

    // Calculate new signups (last 7 days and last 30 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newSignupsWeek = profiles.filter(p => 
      new Date(p.created_at) >= sevenDaysAgo
    ).length;

    const newSignupsMonth = profiles.filter(p => 
      new Date(p.created_at) >= thirtyDaysAgo
    ).length;

    // Fetch subscription events to calculate churn
    const { data: subscriptionEvents } = await supabaseAdmin
      .from("subscription_events")
      .select("event_type, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString());

    const churnCountMonth = subscriptionEvents?.filter(e => 
      e.event_type === "subscription_deleted"
    ).length || 0;

    const churnRate = totalSubscribers > 0 
      ? (churnCountMonth / totalSubscribers) * 100 
      : 0;

    // Fetch failed payments from Stripe
    const failedPayments = await stripe.invoices.list({
      status: "open",
      limit: 100
    });

    const failedPaymentCount = failedPayments.data.filter(inv => 
      inv.attempt_count > 0 && inv.next_payment_attempt
    ).length;

    // Calculate ARPU (Average Revenue Per User)
    const arpu = totalSubscribers > 0 ? mrr / totalSubscribers : 0;

    // Identify at-risk subscribers (failed payments, about to churn)
    const atRiskSubscribers = [];
    
    for (const invoice of failedPayments.data) {
      if (invoice.customer_email) {
        const profile = profiles.find(p => p.email === invoice.customer_email);
        if (profile) {
          atRiskSubscribers.push({
            user_id: profile.user_id,
            email: profile.email,
            tier: profile.subscription_tier,
            reason: "failed_payment",
            amount_due: invoice.amount_due / 100
          });
        }
      }
    }

    // Calculate LTV estimate (simple: MRR * 12 months / churn rate)
    const ltvEstimate = churnRate > 0 
      ? (mrr * 12) / (churnRate / 100)
      : mrr * 24; // If no churn, assume 24 month lifetime

    logStep("Platform metrics calculated");

    // Store in platform_metrics table
    const { error: insertError } = await supabaseAdmin
      .from("platform_metrics")
      .upsert({
        date: now.toISOString().split("T")[0],
        mrr,
        total_subscribers: totalSubscribers,
        subscribers_by_tier: subscribersByTier,
        new_signups_week: newSignupsWeek,
        new_signups_month: newSignupsMonth,
        churn_count_month: churnCountMonth,
        churn_rate: churnRate,
        failed_payments: failedPaymentCount,
        arpu,
        revenue_by_tier: revenueByTier,
        at_risk_subscribers: atRiskSubscribers,
        ltv_estimate: ltvEstimate,
        last_synced: new Date().toISOString()
      }, {
        onConflict: "date"
      });

    if (insertError) {
      logStep("Error storing metrics", { error: insertError.message });
      throw insertError;
    }

    logStep("Platform metrics stored successfully");

    // Create proactive alerts for owner
    const alerts = [];

    if (churnCountMonth > 0) {
      alerts.push({
        user_id: user.id,
        alert_type: "churn_alert",
        severity: churnCountMonth >= 3 ? "critical" : "warning",
        title: `${churnCountMonth} Subscriber${churnCountMonth > 1 ? "s" : ""} Cancelled This Month`,
        message: `${churnCountMonth} subscriber(s) cancelled this month. Consider reaching out to understand why and improve retention.`
      });
    }

    if (atRiskSubscribers.length > 0) {
      alerts.push({
        user_id: user.id,
        alert_type: "failed_payment",
        severity: "warning",
        title: `${atRiskSubscribers.length} Failed Payment${atRiskSubscribers.length > 1 ? "s" : ""}`,
        message: `${atRiskSubscribers.length} subscriber(s) have failed payments. Follow up before they churn.`
      });
    }

    // Calculate MRR growth
    const { data: previousMetrics } = await supabaseAdmin
      .from("platform_metrics")
      .select("mrr")
      .lt("date", now.toISOString().split("T")[0])
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (previousMetrics && previousMetrics.mrr) {
      const mrrGrowth = ((mrr - previousMetrics.mrr) / previousMetrics.mrr) * 100;
      if (mrrGrowth > 5) {
        alerts.push({
          user_id: user.id,
          alert_type: "growth_milestone",
          severity: "info",
          title: `MRR Grew ${mrrGrowth.toFixed(1)}% This Month`,
          message: `Your MRR grew ${mrrGrowth.toFixed(1)}% this month from $${previousMetrics.mrr.toFixed(2)} to $${mrr.toFixed(2)}. You're on track for $${(mrr * 12).toFixed(2)} annual revenue.`
        });
      }
    }

    // Insert alerts
    if (alerts.length > 0) {
      await supabaseAdmin.from("financial_alerts").insert(alerts);
    }

    return new Response(
      JSON.stringify({
        success: true,
        metrics: {
          mrr,
          totalSubscribers,
          subscribersByTier,
          newSignupsWeek,
          newSignupsMonth,
          churnRate,
          arpu,
          atRiskSubscribers: atRiskSubscribers.length
        }
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
