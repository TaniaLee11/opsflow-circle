import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed subscription tiers for AI Studio access
const ALLOWED_TIERS = ['owner', 'ai_enterprise', 'ai_operations', 'cohort'];

// Rate limits per hour by tier
const TIER_RATE_LIMITS: Record<string, number> = {
  'owner': 1000,
  'ai_enterprise': 200,
  'ai_operations': 50,
  'cohort': 25,
};

// Valid generation types
const VALID_TYPES = ['image', 'video', 'audio'];

// Max failed auth attempts per IP per hour
const MAX_AUTH_FAILURES_PER_HOUR = 100;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Extract client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('cf-connecting-ip') || 
                   'unknown';

  try {
    const body = await req.json();
    
    // Handle video status polling
    if (body.predictionId) {
      const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
      if (!REPLICATE_API_KEY) {
        return new Response(
          JSON.stringify({ error: "Video service not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const replicate = new Replicate({ auth: REPLICATE_API_KEY });
      
      console.log(`[studio-generate] Checking prediction status: ${body.predictionId}`);
      const prediction = await replicate.predictions.get(body.predictionId);
      console.log(`[studio-generate] Prediction status: ${prediction.status}`);

      return new Response(
        JSON.stringify({
          status: prediction.status,
          output: prediction.output,
          error: prediction.error,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service client for auth failure tracking
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for failed auth rate limit before processing
    const hourAgoForAuth = new Date(Date.now() - 3600000).toISOString();
    const { count: failedAttempts } = await serviceClient
      .from('auth_failures')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', clientIP)
      .gte('created_at', hourAgoForAuth);

    if ((failedAttempts || 0) >= MAX_AUTH_FAILURES_PER_HOUR) {
      console.log(`[studio-generate] IP ${clientIP} blocked: ${failedAttempts} failed auth attempts`);
      return new Response(
        JSON.stringify({ error: "Too many failed authentication attempts. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log("[studio-generate] Missing or invalid authorization header");
      // Log failed attempt
      await serviceClient.from('auth_failures').insert({
        ip_address: clientIP,
        endpoint: 'studio-generate'
      });
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.log("[studio-generate] Invalid token:", claimsError?.message);
      // Log failed attempt
      await serviceClient.from('auth_failures').insert({
        ip_address: clientIP,
        endpoint: 'studio-generate'
      });
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    console.log(`[studio-generate] Authenticated user: ${userId}`);

    // 2. Check subscription tier using service role (already created above)

    const { data: effectiveTier, error: tierError } = await serviceClient.rpc(
      'get_user_effective_tier',
      { check_user_id: userId }
    );

    if (tierError) {
      console.error("[studio-generate] Tier check error:", tierError.message);
      return new Response(
        JSON.stringify({ error: "Failed to verify subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[studio-generate] User tier: ${effectiveTier}`);

    if (!effectiveTier || !ALLOWED_TIERS.includes(effectiveTier)) {
      return new Response(
        JSON.stringify({ 
          error: "AI Studio requires AI Operations or Enterprise subscription",
          tier: effectiveTier 
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Parse and validate input
    const { type, prompt } = body;

    if (!type || !VALID_TYPES.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid generation type. Must be: image, video, or audio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: "Missing or invalid prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prompt.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Prompt too long. Maximum 5000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Rate limiting
    const hourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count, error: countError } = await serviceClient
      .from('studio_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', hourAgo);

    if (countError) {
      console.error("[studio-generate] Rate limit check error:", countError.message);
    }

    const rateLimit = TIER_RATE_LIMITS[effectiveTier] || 10;
    const currentCount = count || 0;

    if (currentCount >= rateLimit) {
      console.log(`[studio-generate] Rate limit exceeded: ${currentCount}/${rateLimit}`);
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. You've used ${currentCount}/${rateLimit} generations this hour.`,
          retryAfter: 3600
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Get API keys
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("[studio-generate] LOVABLE_API_KEY not configured");
      throw new Error("AI service not configured");
    }

    console.log(`[studio-generate] Generating ${type} with prompt: ${prompt.substring(0, 100)}...`);

    let result;

    if (type === "image") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: `Generate a high-quality image: ${prompt}`
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(
            JSON.stringify({ error: "AI service rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (status === 402) {
          return new Response(
            JSON.stringify({ error: "AI service credits exhausted. Please contact support." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await response.text();
        console.error("[studio-generate] Image generation error:", errorText);
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        throw new Error("No image URL in response");
      }

      result = { url: imageUrl, type: "image" };
    }

    if (type === "video") {
      if (!REPLICATE_API_KEY) {
        console.error("[studio-generate] REPLICATE_API_KEY not configured");
        return new Response(
          JSON.stringify({ error: "Video generation service not configured." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("[studio-generate] Starting Replicate video generation (async)...");

      try {
        const replicate = new Replicate({ auth: REPLICATE_API_KEY });

        // Start the prediction without waiting (videos take 1-3 min)
        const prediction = await replicate.predictions.create({
          model: "minimax/video-01",
          input: {
            prompt: prompt,
            prompt_optimizer: true,
          }
        });

        console.log(`[studio-generate] Video prediction started: ${prediction.id}, status: ${prediction.status}`);

        // Return prediction ID for client to poll
        result = { 
          predictionId: prediction.id,
          status: prediction.status,
          type: "video",
          polling: true
        };
      } catch (replicateError) {
        console.error("[studio-generate] Replicate error:", replicateError);
        
        const errorMessage = replicateError instanceof Error ? replicateError.message : "Unknown error";
        
        if (errorMessage.includes("Invalid API token")) {
          return new Response(
            JSON.stringify({ error: "Invalid Replicate API key. Please check your configuration." }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
          return new Response(
            JSON.stringify({ error: "Replicate rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        throw new Error(`Video generation failed: ${errorMessage}`);
      }
    }

    if (type === "audio") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: "You are a creative audio description assistant. Generate a detailed audio/music concept based on the user's prompt."
            },
            {
              role: "user",
              content: `Create an audio concept for: ${prompt}`
            }
          ]
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(
            JSON.stringify({ error: "AI service rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (status === 402) {
          return new Response(
            JSON.stringify({ error: "AI service credits exhausted. Please contact support." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error("Failed to generate audio concept");
      }

      result = { 
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        type: "audio",
        message: "Audio generation is in beta. This is a sample audio."
      };
    }

    if (!result) {
      return new Response(
        JSON.stringify({ error: "Invalid generation type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Log usage for rate limiting (skip for polling requests)
    if (!result.polling) {
      const { error: insertError } = await serviceClient.from('studio_generations').insert({
        user_id: userId,
        type: type,
        prompt: prompt.substring(0, 500),
        tier: effectiveTier,
      });

      if (insertError) {
        console.error("[studio-generate] Failed to log usage:", insertError.message);
      }
    }

    console.log(`[studio-generate] Successfully processed ${type} for user ${userId}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[studio-generate] Error:", error);
    return new Response(
      JSON.stringify({ error: "Generation failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
