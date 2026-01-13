import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Map price IDs to tier names
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Verify webhook signature
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No Stripe signature found");

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      logStep("Webhook signature verification failed", { error: message });
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${message}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    logStep("Event verified", { type: event.type, id: event.id });

    // Initialize Supabase with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Helper to update user profile subscription status
    const confirmUserSubscription = async (
      userId: string | undefined,
      email: string | undefined,
      tier: string,
      stripeSubscriptionId: string | null
    ) => {
      if (!userId && !email) {
        logStep("Cannot confirm subscription - no user identifier");
        return;
      }

      // First try to find by user_id from metadata
      if (userId) {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_confirmed: true,
            subscription_tier: tier,
            subscription_confirmed_at: new Date().toISOString(),
            stripe_subscription_id: stripeSubscriptionId,
            tier_selected: true,
            selected_tier: tier,
          })
          .eq("user_id", userId);

        if (!error) {
          logStep("Profile subscription confirmed by user_id", { userId, tier });
          return;
        }
        logStep("Failed to update by user_id, trying email", { error: error.message });
      }

      // Fallback to email
      if (email) {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_confirmed: true,
            subscription_tier: tier,
            subscription_confirmed_at: new Date().toISOString(),
            stripe_subscription_id: stripeSubscriptionId,
            tier_selected: true,
            selected_tier: tier,
          })
          .eq("email", email);

        if (error) {
          logStep("Failed to confirm subscription by email", { error: error.message, email });
        } else {
          logStep("Profile subscription confirmed by email", { email, tier });
        }
      }
    };

    // Helper to revoke subscription access
    const revokeUserSubscription = async (userId: string | undefined, email: string | undefined) => {
      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_confirmed: false,
            subscription_tier: null,
            stripe_subscription_id: null,
          })
          .eq("user_id", userId);
        logStep("Subscription access revoked", { userId });
      } else if (email) {
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_confirmed: false,
            subscription_tier: null,
            stripe_subscription_id: null,
          })
          .eq("email", email);
        logStep("Subscription access revoked", { email });
      }
    };

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", {
          sessionId: session.id,
          customerId: session.customer,
          mode: session.mode,
          paymentStatus: session.payment_status,
        });

        const userId = session.metadata?.user_id;
        const userEmail = session.metadata?.user_email || session.customer_email;

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price?.id;
          const tier = PRICE_TO_TIER[priceId] || "unknown";

          logStep("Subscription retrieved", {
            subscriptionId: subscription.id,
            status: subscription.status,
            priceId,
            tier,
          });

          // Confirm subscription in user profile
          await confirmUserSubscription(userId, userEmail || undefined, tier, subscription.id);

          // Record subscription event
          const { error } = await supabaseAdmin.from("subscription_events").insert({
            organization_id: userId || session.customer as string,
            event_type: "subscription_created",
            stripe_subscription_id: subscription.id,
            amount_cents: subscription.items.data[0]?.price?.unit_amount || 0,
            currency: subscription.items.data[0]?.price?.currency || "usd",
            metadata: {
              customer_email: userEmail,
              product_id: subscription.items.data[0]?.price?.product,
              interval: subscription.items.data[0]?.price?.recurring?.interval,
              tier,
            },
          });

          if (error) {
            logStep("Error recording subscription event", { error: error.message });
          } else {
            logStep("Subscription event recorded successfully");
          }
        } else if (session.mode === "payment") {
          // One-time payment - also confirm access
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
          const priceId = lineItems.data[0]?.price?.id;
          const tier = priceId ? (PRICE_TO_TIER[priceId] || "unknown") : "unknown";

          logStep("One-time payment completed", {
            amountTotal: session.amount_total,
            currency: session.currency,
            priceId,
            tier,
          });

          // Confirm payment in user profile
          await confirmUserSubscription(userId, userEmail || undefined, tier, null);

          // Record hour purchase if applicable
          if (session.amount_total) {
            const { error } = await supabaseAdmin.from("hour_purchases").insert({
              organization_id: userId || session.customer as string,
              hours: Math.floor((session.amount_total || 0) / 10000),
              amount_cents: session.amount_total,
              stripe_payment_id: session.payment_intent as string,
            });

            if (error) {
              logStep("Error recording hour purchase", { error: error.message });
            } else {
              logStep("Hour purchase recorded successfully");
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price?.id;
        const tier = priceId ? (PRICE_TO_TIER[priceId] || "unknown") : "unknown";

        logStep("Subscription updated", {
          subscriptionId: subscription.id,
          status: subscription.status,
          tier,
        });

        // Get customer email for lookup
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const customerEmail = "email" in customer ? customer.email : null;

        // Update subscription status based on subscription state
        if (subscription.status === "active") {
          await confirmUserSubscription(
            subscription.metadata?.user_id,
            customerEmail || undefined,
            tier,
            subscription.id
          );
        } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
          await revokeUserSubscription(subscription.metadata?.user_id, customerEmail || undefined);
        }

        const { error } = await supabaseAdmin.from("subscription_events").insert({
          organization_id: subscription.metadata?.user_id || subscription.customer as string,
          event_type: "subscription_updated",
          stripe_subscription_id: subscription.id,
          amount_cents: subscription.items.data[0]?.price?.unit_amount || 0,
          currency: subscription.items.data[0]?.price?.currency || "usd",
          metadata: {
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            tier,
          },
        });

        if (error) {
          logStep("Error recording subscription update", { error: error.message });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription canceled", { subscriptionId: subscription.id });

        // Get customer email for lookup
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const customerEmail = "email" in customer ? customer.email : null;

        // Revoke subscription access
        await revokeUserSubscription(subscription.metadata?.user_id, customerEmail || undefined);

        const { error } = await supabaseAdmin.from("subscription_events").insert({
          organization_id: subscription.metadata?.user_id || subscription.customer as string,
          event_type: "subscription_canceled",
          stripe_subscription_id: subscription.id,
          metadata: {
            canceled_at: subscription.canceled_at,
          },
        });

        if (error) {
          logStep("Error recording subscription cancellation", { error: error.message });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice paid", {
          invoiceId: invoice.id,
          amountPaid: invoice.amount_paid,
        });

        const { error } = await supabaseAdmin.from("subscription_events").insert({
          organization_id: invoice.metadata?.user_id || invoice.customer as string,
          event_type: "invoice_paid",
          stripe_invoice_id: invoice.id,
          stripe_subscription_id: invoice.subscription as string,
          amount_cents: invoice.amount_paid,
          currency: invoice.currency,
        });

        if (error) {
          logStep("Error recording invoice payment", { error: error.message });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment failed", { invoiceId: invoice.id });

        const { error } = await supabaseAdmin.from("subscription_events").insert({
          organization_id: invoice.metadata?.user_id || invoice.customer as string,
          event_type: "payment_failed",
          stripe_invoice_id: invoice.id,
          stripe_subscription_id: invoice.subscription as string,
          amount_cents: invoice.amount_due,
          currency: invoice.currency,
          metadata: {
            attempt_count: invoice.attempt_count,
            next_payment_attempt: invoice.next_payment_attempt,
          },
        });

        if (error) {
          logStep("Error recording payment failure", { error: error.message });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});