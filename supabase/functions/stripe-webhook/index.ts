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

        // Extract user info from metadata
        const userId = session.metadata?.user_id;
        const userEmail = session.metadata?.user_email || session.customer_email;

        if (session.mode === "subscription" && session.subscription) {
          // Handle subscription created
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          logStep("Subscription retrieved", {
            subscriptionId: subscription.id,
            status: subscription.status,
          });

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
            },
          });

          if (error) {
            logStep("Error recording subscription event", { error: error.message });
          } else {
            logStep("Subscription event recorded successfully");
          }
        } else if (session.mode === "payment") {
          // Handle one-time payment
          logStep("One-time payment completed", {
            amountTotal: session.amount_total,
            currency: session.currency,
          });

          // Record hour purchase if applicable
          if (session.amount_total) {
            const { error } = await supabaseAdmin.from("hour_purchases").insert({
              organization_id: userId || session.customer as string,
              hours: Math.floor((session.amount_total || 0) / 10000), // Calculate hours from amount
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
        logStep("Subscription updated", {
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        const { error } = await supabaseAdmin.from("subscription_events").insert({
          organization_id: subscription.metadata?.user_id || subscription.customer as string,
          event_type: "subscription_updated",
          stripe_subscription_id: subscription.id,
          amount_cents: subscription.items.data[0]?.price?.unit_amount || 0,
          currency: subscription.items.data[0]?.price?.currency || "usd",
          metadata: {
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
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
