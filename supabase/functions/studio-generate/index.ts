import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log("[studio-generate] Missing or invalid authorization header");
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
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    console.log(`[studio-generate] Authenticated user: ${userId}`);

    // 2. Check subscription tier using service role
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
    const body = await req.json();
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

    // 5. Get API key
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
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
              content: "You are a creative video description assistant. Generate a detailed video concept based on the user's prompt."
            },
            {
              role: "user",
              content: `Create a video concept for: ${prompt}`
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
        throw new Error("Failed to generate video concept");
      }

      result = { 
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        type: "video",
        message: "Video generation is in beta. This is a sample video."
      };
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

    // 6. Log usage for rate limiting
    const { error: insertError } = await serviceClient.from('studio_generations').insert({
      user_id: userId,
      type: type,
      prompt: prompt.substring(0, 500), // Truncate for storage
      tier: effectiveTier,
    });

    if (insertError) {
      console.error("[studio-generate] Failed to log usage:", insertError.message);
      // Continue anyway - don't block generation if logging fails
    }

    console.log(`[studio-generate] Successfully generated ${type} for user ${userId}`);

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
