/**
 * CRM Fetch - Multi-provider CRM data access
 * 
 * Supports: HubSpot, Salesforce, Zoho CRM, Pipedrive
 * All access via user-specific OAuth tokens only
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { decryptToken } from "../_shared/token-encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CRM_PROVIDERS = ["hubspot", "salesforce", "zoho", "pipedrive"];

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[CRM-FETCH] ${step}`, details ? JSON.stringify(details) : "");
};

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  provider: string;
}

async function getDecryptedToken(supabase: any, userId: string): Promise<TokenData | null> {
  // Find first connected CRM
  const { data: integration, error } = await supabase
    .from("integrations")
    .select("provider, access_token, refresh_token")
    .eq("user_id", userId)
    .in("provider", CRM_PROVIDERS)
    .maybeSingle();

  if (error || !integration) {
    logStep("No CRM integration found", { userId });
    return null;
  }

  const accessToken = await decryptToken(integration.access_token);
  const refreshToken = integration.refresh_token ? await decryptToken(integration.refresh_token) : undefined;

  return {
    accessToken,
    refreshToken,
    provider: integration.provider,
  };
}

// HubSpot API calls
async function fetchHubSpotData(accessToken: string, action: string, query?: string) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  if (action === "summary") {
    // Get contacts count
    const contactsResp = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts?limit=1",
      { headers }
    );
    const contactsData = await contactsResp.json();

    // Get deals
    const dealsResp = await fetch(
      "https://api.hubapi.com/crm/v3/objects/deals?limit=10&properties=dealname,amount,dealstage,closedate",
      { headers }
    );
    const dealsData = await dealsResp.json();

    const deals = dealsData.results || [];
    const openDeals = deals.filter((d: any) => d.properties?.dealstage !== "closedwon" && d.properties?.dealstage !== "closedlost");
    const pipelineValue = openDeals.reduce((sum: number, d: any) => sum + (parseFloat(d.properties?.amount) || 0), 0);

    return {
      summary: {
        provider: "hubspot",
        providerName: "HubSpot",
        totalContacts: contactsData.total || 0,
        totalDeals: deals.length,
        openDeals: openDeals.length,
        pipelineValue,
        recentContacts: [],
        hotDeals: openDeals.slice(0, 5).map((d: any) => ({
          id: d.id,
          name: d.properties?.dealname || "Unnamed Deal",
          value: parseFloat(d.properties?.amount) || 0,
          stage: d.properties?.dealstage,
          expectedCloseDate: d.properties?.closedate,
          provider: "hubspot",
        })),
      },
    };
  }

  if (action === "search_contact" && query) {
    const searchResp = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/search`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: "firstname",
              operator: "CONTAINS_TOKEN",
              value: query,
            }],
          }],
          properties: ["firstname", "lastname", "email", "phone", "company"],
          limit: 10,
        }),
      }
    );
    const searchData = await searchResp.json();

    return {
      contacts: (searchData.results || []).map((c: any) => ({
        id: c.id,
        name: `${c.properties?.firstname || ""} ${c.properties?.lastname || ""}`.trim(),
        email: c.properties?.email,
        phone: c.properties?.phone,
        company: c.properties?.company,
        provider: "hubspot",
      })),
    };
  }

  if (action === "search_deal" && query) {
    const searchResp = await fetch(
      `https://api.hubapi.com/crm/v3/objects/deals/search`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: "dealname",
              operator: "CONTAINS_TOKEN",
              value: query,
            }],
          }],
          properties: ["dealname", "amount", "dealstage", "closedate"],
          limit: 10,
        }),
      }
    );
    const searchData = await searchResp.json();

    return {
      deals: (searchData.results || []).map((d: any) => ({
        id: d.id,
        name: d.properties?.dealname || "Unnamed Deal",
        value: parseFloat(d.properties?.amount) || 0,
        stage: d.properties?.dealstage,
        expectedCloseDate: d.properties?.closedate,
        provider: "hubspot",
      })),
    };
  }

  return { message: "Action not supported for HubSpot" };
}

// Salesforce API calls
async function fetchSalesforceData(accessToken: string, action: string, query?: string) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  // Note: Salesforce requires instance URL which should be stored during OAuth
  // For now, using standard login URL
  const baseUrl = "https://login.salesforce.com/services/data/v58.0";

  if (action === "summary") {
    try {
      const contactsResp = await fetch(
        `${baseUrl}/query?q=SELECT COUNT() FROM Contact`,
        { headers }
      );
      const contactsData = await contactsResp.json();

      const dealsResp = await fetch(
        `${baseUrl}/query?q=SELECT Id,Name,Amount,StageName,CloseDate FROM Opportunity LIMIT 10`,
        { headers }
      );
      const dealsData = await dealsResp.json();

      const deals = dealsData.records || [];
      const openDeals = deals.filter((d: any) => !d.StageName?.includes("Closed"));
      const pipelineValue = openDeals.reduce((sum: number, d: any) => sum + (d.Amount || 0), 0);

      return {
        summary: {
          provider: "salesforce",
          providerName: "Salesforce",
          totalContacts: contactsData.totalSize || 0,
          totalDeals: deals.length,
          openDeals: openDeals.length,
          pipelineValue,
          recentContacts: [],
          hotDeals: openDeals.slice(0, 5).map((d: any) => ({
            id: d.Id,
            name: d.Name,
            value: d.Amount || 0,
            stage: d.StageName,
            expectedCloseDate: d.CloseDate,
            provider: "salesforce",
          })),
        },
      };
    } catch (err) {
      logStep("Salesforce API error", { error: String(err) });
      throw new Error("Failed to fetch Salesforce data");
    }
  }

  if (action === "search_contact" && query) {
    const searchResp = await fetch(
      `${baseUrl}/query?q=SELECT Id,Name,Email,Phone,Account.Name FROM Contact WHERE Name LIKE '%${query}%' LIMIT 10`,
      { headers }
    );
    const searchData = await searchResp.json();

    return {
      contacts: (searchData.records || []).map((c: any) => ({
        id: c.Id,
        name: c.Name,
        email: c.Email,
        phone: c.Phone,
        company: c.Account?.Name,
        provider: "salesforce",
      })),
    };
  }

  return { message: "Action not supported for Salesforce" };
}

// Pipedrive API calls
async function fetchPipedriveData(accessToken: string, action: string, query?: string) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const baseUrl = "https://api.pipedrive.com/v1";

  if (action === "summary") {
    const personsResp = await fetch(`${baseUrl}/persons?start=0&limit=1`, { headers });
    const personsData = await personsResp.json();

    const dealsResp = await fetch(`${baseUrl}/deals?start=0&limit=10&status=open`, { headers });
    const dealsData = await dealsResp.json();

    const deals = dealsData.data || [];
    const pipelineValue = deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);

    return {
      summary: {
        provider: "pipedrive",
        providerName: "Pipedrive",
        totalContacts: personsData.additional_data?.pagination?.total_count || 0,
        totalDeals: dealsData.additional_data?.pagination?.total_count || 0,
        openDeals: deals.length,
        pipelineValue,
        recentContacts: [],
        hotDeals: deals.slice(0, 5).map((d: any) => ({
          id: d.id,
          name: d.title,
          value: d.value || 0,
          stage: d.stage_id?.toString(),
          expectedCloseDate: d.expected_close_date,
          provider: "pipedrive",
        })),
      },
    };
  }

  if (action === "search_contact" && query) {
    const searchResp = await fetch(
      `${baseUrl}/persons/search?term=${encodeURIComponent(query)}&limit=10`,
      { headers }
    );
    const searchData = await searchResp.json();

    return {
      contacts: (searchData.data?.items || []).map((item: any) => ({
        id: item.item?.id,
        name: item.item?.name,
        email: item.item?.primary_email,
        phone: item.item?.primary_phone,
        company: item.item?.organization?.name,
        provider: "pipedrive",
      })),
    };
  }

  if (action === "search_deal" && query) {
    const searchResp = await fetch(
      `${baseUrl}/deals/search?term=${encodeURIComponent(query)}&limit=10`,
      { headers }
    );
    const searchData = await searchResp.json();

    return {
      deals: (searchData.data?.items || []).map((item: any) => ({
        id: item.item?.id,
        name: item.item?.title,
        value: item.item?.value || 0,
        stage: item.item?.stage?.name,
        provider: "pipedrive",
      })),
    };
  }

  return { message: "Action not supported for Pipedrive" };
}

// Zoho CRM API calls
async function fetchZohoData(accessToken: string, action: string, query?: string) {
  const headers = {
    Authorization: `Zoho-oauthtoken ${accessToken}`,
    "Content-Type": "application/json",
  };

  const baseUrl = "https://www.zohoapis.com/crm/v3";

  if (action === "summary") {
    const contactsResp = await fetch(`${baseUrl}/Contacts?per_page=1`, { headers });
    const contactsData = await contactsResp.json();

    const dealsResp = await fetch(`${baseUrl}/Deals?per_page=10`, { headers });
    const dealsData = await dealsResp.json();

    const deals = dealsData.data || [];
    const openDeals = deals.filter((d: any) => d.Stage !== "Closed Won" && d.Stage !== "Closed Lost");
    const pipelineValue = openDeals.reduce((sum: number, d: any) => sum + (d.Amount || 0), 0);

    return {
      summary: {
        provider: "zoho",
        providerName: "Zoho CRM",
        totalContacts: contactsData.info?.count || 0,
        totalDeals: deals.length,
        openDeals: openDeals.length,
        pipelineValue,
        recentContacts: [],
        hotDeals: openDeals.slice(0, 5).map((d: any) => ({
          id: d.id,
          name: d.Deal_Name,
          value: d.Amount || 0,
          stage: d.Stage,
          expectedCloseDate: d.Closing_Date,
          provider: "zoho",
        })),
      },
    };
  }

  if (action === "search_contact" && query) {
    const searchResp = await fetch(
      `${baseUrl}/Contacts/search?criteria=(Full_Name:contains:${encodeURIComponent(query)})`,
      { headers }
    );
    const searchData = await searchResp.json();

    return {
      contacts: (searchData.data || []).map((c: any) => ({
        id: c.id,
        name: c.Full_Name,
        email: c.Email,
        phone: c.Phone,
        company: c.Account_Name?.name,
        title: c.Title,
        provider: "zoho",
      })),
    };
  }

  return { message: "Action not supported for Zoho CRM" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    const { action, query, contactData, dealData } = await req.json();
    logStep("Request", { action, query });

    // Get CRM token
    const tokenData = await getDecryptedToken(supabaseClient, user.id);
    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: "OAUTH_REQUIRED: No CRM connected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep("CRM provider", { provider: tokenData.provider });

    // Route to appropriate provider
    let result;
    switch (tokenData.provider) {
      case "hubspot":
        result = await fetchHubSpotData(tokenData.accessToken, action, query);
        break;
      case "salesforce":
        result = await fetchSalesforceData(tokenData.accessToken, action, query);
        break;
      case "pipedrive":
        result = await fetchPipedriveData(tokenData.accessToken, action, query);
        break;
      case "zoho":
        result = await fetchZohoData(tokenData.accessToken, action, query);
        break;
      default:
        result = { error: `Unsupported CRM provider: ${tokenData.provider}` };
    }

    logStep("CRM action completed", { provider: tokenData.provider, action });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
