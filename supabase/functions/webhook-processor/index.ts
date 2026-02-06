// Webhook Processor - Processes queued webhook events with retry logic
// Features: Exponential backoff, max 6 retries, error tracking, owner alerts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const MAX_RETRIES = 6;
const RETRY_DELAYS = [1, 2, 4, 8, 16, 32]; // seconds

// Process a single webhook event
async function processWebhookEvent(
  supabase: any,
  event: any
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Processing ${event.source} webhook: ${event.event_type}`);

    // Route to appropriate handler based on source
    switch (event.source) {
      case 'stripe':
        return await processStripeWebhook(supabase, event);
      
      case 'quickbooks':
        return await processQuickBooksWebhook(supabase, event);
      
      case 'plaid':
        return await processPlaidWebhook(supabase, event);
      
      case 'zapier':
        return await processZapierWebhook(supabase, event);
      
      default:
        console.log(`Unknown webhook source: ${event.source}`);
        return { success: true }; // Don't retry unknown sources
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return { success: false, error: error.message };
  }
}

// Process Stripe webhooks
async function processStripeWebhook(
  supabase: any,
  event: any
): Promise<{ success: boolean; error?: string }> {
  const { event_type, payload } = event;

  try {
    switch (event_type) {
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        // Update subscription status, record payment
        console.log('Stripe invoice paid:', payload.id);
        // TODO: Update user subscription status
        break;

      case 'invoice.payment_failed':
        // Alert user about failed payment
        console.log('Stripe payment failed:', payload.id);
        // TODO: Send notification to user
        break;

      case 'customer.subscription.deleted':
        // Downgrade user to free tier
        console.log('Stripe subscription cancelled:', payload.id);
        // TODO: Update user tier
        break;

      case 'checkout.session.completed':
        // New subscription created
        console.log('Stripe checkout completed:', payload.id);
        // TODO: Activate user subscription
        break;

      default:
        console.log(`Unhandled Stripe event: ${event_type}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Process QuickBooks webhooks
async function processQuickBooksWebhook(
  supabase: any,
  event: any
): Promise<{ success: boolean; error?: string }> {
  const { event_type, payload } = event;

  try {
    console.log('QuickBooks webhook:', event_type);
    
    // Extract entities from QuickBooks notification
    const entities = payload.eventNotifications?.[0]?.dataChangeEvent?.entities || [];
    
    for (const entity of entities) {
      const entityName = entity.name; // 'Invoice', 'Payment', 'Customer', etc.
      const entityId = entity.id;
      
      console.log(`QuickBooks ${entityName} changed: ${entityId}`);
      
      // TODO: Sync QuickBooks data to our database
      // TODO: Trigger AI reconciliation if needed
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Process Plaid webhooks
async function processPlaidWebhook(
  supabase: any,
  event: any
): Promise<{ success: boolean; error?: string }> {
  const { event_type, payload } = event;

  try {
    console.log('Plaid webhook:', event_type);

    switch (event_type) {
      case 'TRANSACTIONS':
        // New transactions available
        console.log('Plaid transactions available for item:', payload.item_id);
        // TODO: Fetch and store new transactions
        // TODO: Trigger AI bank reconciliation
        break;

      case 'ITEM_LOGIN_REQUIRED':
        // User needs to re-authenticate
        console.log('Plaid re-auth required for item:', payload.item_id);
        // TODO: Send notification to user
        break;

      case 'ERROR':
        // Plaid error occurred
        console.log('Plaid error for item:', payload.item_id, payload.error);
        // TODO: Alert user and owner
        break;

      default:
        console.log(`Unhandled Plaid event: ${event_type}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Process Zapier webhooks
async function processZapierWebhook(
  supabase: any,
  event: any
): Promise<{ success: boolean; error?: string }> {
  const { event_type, payload } = event;

  try {
    console.log('Zapier webhook:', event_type);
    
    // Zapier webhooks are custom - just log and store
    // TODO: Route to appropriate handler based on payload structure
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Calculate next retry time with exponential backoff
function calculateNextRetry(retryCount: number): string {
  const delaySeconds = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)];
  const nextRetry = new Date(Date.now() + delaySeconds * 1000);
  return nextRetry.toISOString();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending webhook events from queue
    const { data: queueItems, error: queueError } = await supabase
      .from('webhook_queue')
      .select(`
        *,
        webhook_events (*)
      `)
      .eq('status', 'pending')
      .lte('next_retry_at', new Date().toISOString())
      .limit(10); // Process up to 10 events at a time

    if (queueError) {
      console.error('Error fetching queue:', queueError);
      throw queueError;
    }

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No pending webhooks to process'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${queueItems.length} webhook events`);

    const results = [];

    for (const item of queueItems) {
      const event = item.webhook_events;
      
      // Mark as processing
      await supabase
        .from('webhook_queue')
        .update({ status: 'processing' })
        .eq('id', item.id);

      // Process the event
      const result = await processWebhookEvent(supabase, event);

      if (result.success) {
        // Mark as completed
        await supabase
          .from('webhook_queue')
          .update({ 
            status: 'completed',
            error_message: null
          })
          .eq('id', item.id);

        await supabase
          .from('webhook_events')
          .update({ 
            processed: true,
            processed_at: new Date().toISOString()
          })
          .eq('id', event.id);

        results.push({ event_id: event.event_id, status: 'completed' });
        console.log(`Successfully processed: ${event.event_id}`);

      } else {
        // Failed - check retry count
        const newRetryCount = event.retry_count + 1;

        if (newRetryCount >= MAX_RETRIES) {
          // Max retries reached - mark as failed
          await supabase
            .from('webhook_queue')
            .update({ 
              status: 'failed',
              error_message: result.error || 'Max retries exceeded'
            })
            .eq('id', item.id);

          await supabase
            .from('webhook_events')
            .update({ 
              retry_count: newRetryCount,
              last_error: result.error || 'Max retries exceeded'
            })
            .eq('id', event.id);

          results.push({ event_id: event.event_id, status: 'failed', error: result.error });
          console.error(`Failed after ${MAX_RETRIES} retries: ${event.event_id}`);

          // TODO: Alert owner about persistent failure

        } else {
          // Schedule retry with exponential backoff
          const nextRetry = calculateNextRetry(newRetryCount);

          await supabase
            .from('webhook_queue')
            .update({ 
              status: 'pending',
              next_retry_at: nextRetry,
              error_message: result.error
            })
            .eq('id', item.id);

          await supabase
            .from('webhook_events')
            .update({ 
              retry_count: newRetryCount,
              last_error: result.error
            })
            .eq('id', event.id);

          results.push({ 
            event_id: event.event_id, 
            status: 'retrying', 
            retry_count: newRetryCount,
            next_retry: nextRetry
          });
          console.log(`Scheduled retry ${newRetryCount}/${MAX_RETRIES} for: ${event.event_id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processor error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
