/**
 * Stripe Connect Sync - User Financial Data
 * 
 * PURPOSE: Fetches financial data from each user's connected Stripe account
 * 
 * PRIVACY: Each user's Stripe data is PRIVATE to them. No cross-user access.
 * Owner connects her own Stripe and sees her own data — same as everyone else.
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
  console.log(`[STRIPE-CONNECT-SYNC] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    logStep("User authenticated", { userId: user.id });

    // Get user's Stripe Connect integration
    const { data: integration } = await supabaseAdmin
      .from("integrations")
      .select("access_token, refresh_token, provider_account_id")
      .eq("user_id", user.id)
      .eq("provider", "stripe")
      .eq("status", "active")
      .single();

    if (!integration || !integration.access_token) {
      logStep("No Stripe Connect integration found");
      return new Response(
        JSON.stringify({ error: "Stripe not connected" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Stripe integration found", { accountId: integration.provider_account_id });

    // Initialize Stripe with user's access token
    const stripe = new Stripe(integration.access_token, { 
      apiVersion: "2025-08-27.basil" 
    });

    // Fetch financial data
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    logStep("Fetching charges and balance");

    // Fetch charges (revenue)
    const [charges30d, charges90d, chargesYtd, balance, invoices] = await Promise.all([
      stripe.charges.list({ 
        created: { gte: Math.floor(thirtyDaysAgo.getTime() / 1000) },
        limit: 100 
      }),
      stripe.charges.list({ 
        created: { gte: Math.floor(ninetyDaysAgo.getTime() / 1000) },
        limit: 100 
      }),
      stripe.charges.list({ 
        created: { gte: Math.floor(yearStart.getTime() / 1000) },
        limit: 100 
      }),
      stripe.balance.retrieve(),
      stripe.invoices.list({ limit: 100 })
    ]);

    // Calculate revenue
    const revenue30d = charges30d.data
      .filter(c => c.status === "succeeded")
      .reduce((sum, c) => sum + c.amount, 0) / 100;

    const revenue90d = charges90d.data
      .filter(c => c.status === "succeeded")
      .reduce((sum, c) => sum + c.amount, 0) / 100;

    const revenueYtd = chargesYtd.data
      .filter(c => c.status === "succeeded")
      .reduce((sum, c) => sum + c.amount, 0) / 100;

    // Calculate invoice metrics
    const overdueInvoices = invoices.data.filter(inv => 
      inv.status === "open" && inv.due_date && inv.due_date < Math.floor(now.getTime() / 1000)
    );

    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.amount_due || 0), 0) / 100;

    const outstandingInvoices = invoices.data.filter(inv => inv.status === "open");

    // Get recent charges for display
    const recentCharges = charges30d.data.slice(0, 10).map(c => ({
      id: c.id,
      amount: c.amount / 100,
      currency: c.currency,
      status: c.status,
      description: c.description,
      created: c.created,
      customer: c.customer
    }));

    // Calculate monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthCharges = chargesYtd.data.filter(c => {
        const chargeDate = new Date(c.created * 1000);
        return chargeDate >= monthStart && chargeDate <= monthEnd && c.status === "succeeded";
      });

      const monthRevenue = monthCharges.reduce((sum, c) => sum + c.amount, 0) / 100;

      monthlyTrend.push({
        month: monthStart.toISOString().slice(0, 7),
        revenue: monthRevenue,
        expenses: 0 // Would need to fetch from expenses API if available
      });
    }

    // Determine cash flow status
    let cashFlowStatus = "healthy";
    if (overdueAmount > revenue30d * 0.3) {
      cashFlowStatus = "critical";
    } else if (overdueAmount > revenue30d * 0.1) {
      cashFlowStatus = "warning";
    }

    // Get payout schedule
    const payouts = await stripe.payouts.list({ limit: 5 });
    const payoutSchedule = {
      nextPayout: payouts.data[0] ? {
        amount: payouts.data[0].amount / 100,
        arrival_date: payouts.data[0].arrival_date,
        status: payouts.data[0].status
      } : null,
      recentPayouts: payouts.data.slice(0, 5).map(p => ({
        amount: p.amount / 100,
        arrival_date: p.arrival_date,
        status: p.status
      }))
    };

    // Store in user_financial_summary
    const { error: updateError } = await supabaseAdmin
      .from("user_financial_summary")
      .upsert({
        user_id: user.id,
        provider: "stripe_connect",
        total_revenue_30d: revenue30d,
        total_revenue_90d: revenue90d,
        total_revenue_ytd: revenueYtd,
        outstanding_invoices: outstandingInvoices.length,
        overdue_invoices: overdueInvoices.length,
        overdue_amount: overdueAmount,
        recent_charges: recentCharges,
        monthly_trend: monthlyTrend,
        cash_flow_status: cashFlowStatus,
        payout_schedule: payoutSchedule,
        stripe_account_id: integration.provider_account_id,
        last_synced: new Date().toISOString(),
        sync_status: "success",
        sync_error: null
      }, {
        onConflict: "user_id"
      });

    if (updateError) {
      logStep("Error updating financial summary", { error: updateError.message });
      throw updateError;
    }

    logStep("Financial data synced successfully");

    // Create alerts for overdue invoices
    if (overdueInvoices.length > 0) {
      await supabaseAdmin.from("financial_alerts").insert({
        user_id: user.id,
        alert_type: "overdue_invoice",
        severity: overdueAmount > revenue30d * 0.3 ? "critical" : "warning",
        title: `${overdueInvoices.length} Overdue Invoice${overdueInvoices.length > 1 ? "s" : ""}`,
        message: `You have ${overdueInvoices.length} overdue invoice(s) totaling $${overdueAmount.toFixed(2)}. Consider following up with customers.`
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          revenue30d,
          revenue90d,
          revenueYtd,
          outstandingInvoices: outstandingInvoices.length,
          overdueInvoices: overdueInvoices.length,
          overdueAmount,
          cashFlowStatus
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // Update sync status to error
    try {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          await supabaseAdmin
            .from("user_financial_summary")
            .upsert({
              user_id: user.id,
              sync_status: "error",
              sync_error: errorMessage,
              last_synced: new Date().toISOString()
            }, {
              onConflict: "user_id"
            });
        }
      }
    } catch (e) {
      // Ignore error updating error status
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
