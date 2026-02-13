import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GHLOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: string;
  contactId: string;
  monetaryValue: number;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ghlApiKey = Deno.env.get("GHL_API_KEY");
    const ghlLocationId = Deno.env.get("GHL_LOCATION_ID") || "xVT2gzHtEAYCuwmWgAbG";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if GHL API key is configured
    if (!ghlApiKey) {
      console.log("GHL API key not configured, returning placeholder data");
      return new Response(
        JSON.stringify({
          success: true,
          message: "GHL API key not configured. Complete Private Integration setup in GoHighLevel.",
          opportunities: [],
          contacts: [],
          setupRequired: true,
          setupInstructions: {
            step1: "Go to GoHighLevel > Settings > Private Integrations",
            step2: "Create integration with scopes: contacts.readonly, contacts.write, opportunities.readonly, opportunities.write, workflows.readonly",
            step3: "Copy the API key and add it to Supabase secrets as GHL_API_KEY",
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Fetch opportunities from GoHighLevel
    const opportunitiesResponse = await fetch(
      `https://services.leadconnectorhq.com/opportunities/search?location_id=${ghlLocationId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          Version: "2021-07-28",
          Accept: "application/json",
        },
      }
    );

    if (!opportunitiesResponse.ok) {
      throw new Error(`GHL API error: ${opportunitiesResponse.status} ${opportunitiesResponse.statusText}`);
    }

    const opportunitiesData = await opportunitiesResponse.json();
    const opportunities: GHLOpportunity[] = opportunitiesData.opportunities || [];

    // Fetch contacts for each opportunity
    const contactIds = [...new Set(opportunities.map((opp) => opp.contactId))];
    const contacts: GHLContact[] = [];

    for (const contactId of contactIds) {
      try {
        const contactResponse = await fetch(
          `https://services.leadconnectorhq.com/contacts/${contactId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${ghlApiKey}`,
              Version: "2021-07-28",
              Accept: "application/json",
            },
          }
        );

        if (contactResponse.ok) {
          const contactData = await contactResponse.json();
          contacts.push(contactData.contact);
        }
      } catch (error) {
        console.error(`Error fetching contact ${contactId}:`, error);
      }
    }

    // Store in database for caching
    const { error: syncError } = await supabase
      .from("ghl_pipeline_sync")
      .upsert({
        location_id: ghlLocationId,
        opportunities: opportunities,
        contacts: contacts,
        synced_at: new Date().toISOString(),
      });

    if (syncError) {
      console.error("Error storing sync data:", syncError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        opportunities,
        contacts,
        syncedAt: new Date().toISOString(),
        setupRequired: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in ghl-sync-pipeline:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        setupRequired: !Deno.env.get("GHL_API_KEY"),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
