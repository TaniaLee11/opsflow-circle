// Webhook Receiver - Universal webhook endpoint for all integrations
// Handles: Stripe, QuickBooks, Plaid, Zapier, and other webhooks
// Features: Signature verification, deduplication, retry logic

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-quickbooks-signature, plaid-verification',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface WebhookEvent {
  source: string;
  event_type: string;
  event_id: string;
  payload: Record<string, any>;
  signature?: string;
}

// Verify Stripe webhook signature
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const elements = signature.split(',');
    const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1];
    const sig = elements.find(e => e.startsWith('v1='))?.split('=')[1];
    
    if (!timestamp || !sig) return false;
    
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature_bytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );
    
    const expected_sig = Array.from(new Uint8Array(signature_bytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return expected_sig === sig;
  } catch (error) {
    console.error('Stripe signature verification error:', error);
    return false;
  }
}

// Verify QuickBooks webhook signature
async function verifyQuickBooksSignature(
  payload: string,
  signature: string,
  verifier_token: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(verifier_token),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature_bytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );
    
    const expected_sig = btoa(String.fromCharCode(...new Uint8Array(signature_bytes)));
    
    return expected_sig === signature;
  } catch (error) {
    console.error('QuickBooks signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get webhook source from path or header
    const url = new URL(req.url);
    const source = url.searchParams.get('source') || req.headers.get('x-webhook-source') || 'unknown';
    
    console.log(`Received webhook from source: ${source}`);

    // Read raw body for signature verification
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify signature based on source
    let signatureValid = true;
    const signature = req.headers.get('stripe-signature') || 
                     req.headers.get('x-quickbooks-signature') ||
                     req.headers.get('plaid-verification');

    if (source === 'stripe' && signature) {
      const stripeSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
      if (stripeSecret) {
        signatureValid = await verifyStripeSignature(rawBody, signature, stripeSecret);
        if (!signatureValid) {
          console.error('Invalid Stripe signature');
          return new Response(
            JSON.stringify({ error: 'Invalid signature' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } else if (source === 'quickbooks' && signature) {
      const qbVerifier = Deno.env.get('QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN');
      if (qbVerifier) {
        signatureValid = await verifyQuickBooksSignature(rawBody, signature, qbVerifier);
        if (!signatureValid) {
          console.error('Invalid QuickBooks signature');
          return new Response(
            JSON.stringify({ error: 'Invalid signature' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Extract event details based on source
    let event_type: string;
    let event_id: string;

    switch (source) {
      case 'stripe':
        event_type = payload.type || 'unknown';
        event_id = payload.id || `stripe_${Date.now()}`;
        break;
      
      case 'quickbooks':
        event_type = payload.eventNotifications?.[0]?.dataChangeEvent?.entities?.[0]?.name || 'unknown';
        event_id = payload.eventNotifications?.[0]?.realmId + '_' + Date.now();
        break;
      
      case 'plaid':
        event_type = payload.webhook_type || 'unknown';
        event_id = payload.webhook_code + '_' + (payload.item_id || Date.now());
        break;
      
      case 'zapier':
        event_type = payload.event_type || 'zapier.action';
        event_id = payload.id || `zapier_${Date.now()}`;
        break;
      
      default:
        event_type = payload.type || payload.event || 'unknown';
        event_id = payload.id || `${source}_${Date.now()}`;
    }

    console.log(`Processing event: ${event_type} (${event_id})`);

    // Store webhook event (with deduplication via unique constraint)
    const { data: webhookEvent, error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        source,
        event_type,
        event_id,
        payload,
        signature: signature || null,
        processed: false,
        retry_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      // Check if it's a duplicate event
      if (insertError.code === '23505') { // Unique constraint violation
        console.log(`Duplicate event ignored: ${event_id}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Event already processed',
            event_id 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.error('Error storing webhook event:', insertError);
      throw insertError;
    }

    // Add to processing queue
    const { error: queueError } = await supabase
      .from('webhook_queue')
      .insert({
        webhook_event_id: webhookEvent.id,
        status: 'pending',
        next_retry_at: new Date().toISOString(),
      });

    if (queueError) {
      console.error('Error adding to queue:', queueError);
      throw queueError;
    }

    console.log(`Webhook event stored and queued: ${webhookEvent.id}`);

    // Return success immediately (processing happens async)
    return new Response(
      JSON.stringify({ 
        success: true,
        event_id,
        webhook_event_id: webhookEvent.id,
        message: 'Webhook received and queued for processing'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook receiver error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
