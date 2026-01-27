import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CRMContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  lastContacted?: string;
  status?: string;
  provider: string;
}

export interface CRMDeal {
  id: string;
  name: string;
  value?: number;
  stage?: string;
  company?: string;
  contactName?: string;
  expectedCloseDate?: string;
  provider: string;
}

export interface CRMSummary {
  provider: string;
  providerName: string;
  totalContacts: number;
  totalDeals: number;
  openDeals: number;
  pipelineValue: number;
  recentContacts: CRMContact[];
  hotDeals: CRMDeal[];
}

export interface CRMIntent {
  action: "scan" | "search_contact" | "search_deal" | "create_contact" | "update_contact" | "create_deal" | "update_deal" | "summary";
  query?: string;
  contactData?: Partial<CRMContact>;
  dealData?: Partial<CRMDeal>;
}

export function useVOPSyCRMIntelligence() {
  const [isLoading, setIsLoading] = useState(false);
  const [crmSummary, setCRMSummary] = useState<CRMSummary | null>(null);
  const [searchResults, setSearchResults] = useState<{
    contacts: CRMContact[];
    deals: CRMDeal[];
  } | null>(null);
  const [connectedCRMs, setConnectedCRMs] = useState<string[]>([]);

  // Check which CRM providers are connected
  const checkConnectedCRMs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("integrations")
        .select("provider")
        .in("provider", ["hubspot", "salesforce", "zoho", "pipedrive"]);

      if (error) throw error;
      const providers = (data || []).map(i => i.provider);
      setConnectedCRMs(providers);
      return providers;
    } catch (err) {
      console.error("Failed to check CRM connections:", err);
      return [];
    }
  }, []);

  // Parse user intent from message
  const parseCRMIntent = useCallback((message: string): CRMIntent | null => {
    const lower = message.toLowerCase();

    // CRM scan/summary
    if (lower.includes("crm") && (lower.includes("scan") || lower.includes("summary") || lower.includes("overview"))) {
      return { action: "summary" };
    }

    // Search contacts
    if ((lower.includes("find") || lower.includes("search") || lower.includes("look up") || lower.includes("who is")) &&
        (lower.includes("contact") || lower.includes("client") || lower.includes("customer") || lower.includes("lead"))) {
      const nameMatch = message.match(/(?:find|search|look up|who is)\s+(?:contact|client|customer|lead)?\s*[:\s]?\s*(.+)/i);
      return { action: "search_contact", query: nameMatch?.[1]?.trim() || message };
    }

    // Search deals
    if ((lower.includes("find") || lower.includes("search") || lower.includes("check")) &&
        (lower.includes("deal") || lower.includes("opportunity") || lower.includes("pipeline"))) {
      const queryMatch = message.match(/(?:find|search|check)\s+(?:deal|opportunity)?\s*[:\s]?\s*(.+)/i);
      return { action: "search_deal", query: queryMatch?.[1]?.trim() || message };
    }

    // Create contact
    if (lower.includes("add") && (lower.includes("contact") || lower.includes("client") || lower.includes("lead"))) {
      return { action: "create_contact" };
    }

    // Update contact
    if (lower.includes("update") && (lower.includes("contact") || lower.includes("client"))) {
      return { action: "update_contact" };
    }

    // Create deal
    if ((lower.includes("create") || lower.includes("add") || lower.includes("new")) && 
        (lower.includes("deal") || lower.includes("opportunity"))) {
      return { action: "create_deal" };
    }

    // Pipeline value or deals
    if (lower.includes("pipeline") || lower.includes("deals") || lower.includes("opportunities")) {
      return { action: "summary" };
    }

    return null;
  }, []);

  // Execute CRM action
  const executeCRMAction = useCallback(async (intent: CRMIntent): Promise<string> => {
    setIsLoading(true);

    try {
      const providers = await checkConnectedCRMs();

      if (providers.length === 0) {
        return "No CRM is connected yet. You can connect HubSpot, Salesforce, Zoho CRM, or Pipedrive from the Automations page. Once connected, I can help you manage contacts, track deals, and analyze your pipeline.";
      }

      const { data, error } = await supabase.functions.invoke("crm-fetch", {
        body: {
          action: intent.action,
          query: intent.query,
          contactData: intent.contactData,
          dealData: intent.dealData,
        },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.error.includes("OAUTH_REQUIRED")) {
          return "Your CRM connection needs to be refreshed. Please reconnect from the Automations page.";
        }
        throw new Error(data.error);
      }

      // Handle different response types
      if (intent.action === "summary" && data?.summary) {
        setCRMSummary(data.summary);
        const s = data.summary;
        const providerNames: Record<string, string> = {
          hubspot: "HubSpot",
          salesforce: "Salesforce",
          zoho: "Zoho CRM",
          pipedrive: "Pipedrive",
        };
        
        let response = `**${providerNames[s.provider] || s.provider} CRM Summary**\n\n`;
        response += `📊 **Overview**\n`;
        response += `• Total Contacts: ${s.totalContacts.toLocaleString()}\n`;
        response += `• Total Deals: ${s.totalDeals}\n`;
        response += `• Open Deals: ${s.openDeals}\n`;
        response += `• Pipeline Value: $${s.pipelineValue.toLocaleString()}\n\n`;

        if (s.hotDeals && s.hotDeals.length > 0) {
          response += `🔥 **Hot Deals**\n`;
          s.hotDeals.forEach((deal: CRMDeal, i: number) => {
            response += `${i + 1}. ${deal.name} - $${(deal.value || 0).toLocaleString()} (${deal.stage})\n`;
          });
          response += `\n`;
        }

        if (s.recentContacts && s.recentContacts.length > 0) {
          response += `👤 **Recent Contacts**\n`;
          s.recentContacts.forEach((contact: CRMContact, i: number) => {
            response += `${i + 1}. ${contact.name}${contact.company ? ` at ${contact.company}` : ""}\n`;
          });
        }

        response += `\nWould you like me to search for a specific contact, review a deal, or create a new record?`;
        return response;
      }

      if (intent.action === "search_contact" && data?.contacts) {
        setSearchResults({ contacts: data.contacts, deals: [] });
        
        if (data.contacts.length === 0) {
          return `I couldn't find any contacts matching "${intent.query}". Would you like me to add them as a new contact?`;
        }

        let response = `**Found ${data.contacts.length} contact(s) matching "${intent.query}":**\n\n`;
        data.contacts.forEach((contact: CRMContact, i: number) => {
          response += `**${i + 1}. ${contact.name}**\n`;
          if (contact.email) response += `   📧 ${contact.email}\n`;
          if (contact.phone) response += `   📞 ${contact.phone}\n`;
          if (contact.company) response += `   🏢 ${contact.company}\n`;
          if (contact.title) response += `   💼 ${contact.title}\n`;
          response += `\n`;
        });

        response += `Would you like me to update any of these contacts or create a follow-up task?`;
        return response;
      }

      if (intent.action === "search_deal" && data?.deals) {
        setSearchResults({ contacts: [], deals: data.deals });

        if (data.deals.length === 0) {
          return `I couldn't find any deals matching "${intent.query}". Would you like me to create a new deal?`;
        }

        let response = `**Found ${data.deals.length} deal(s) matching "${intent.query}":**\n\n`;
        data.deals.forEach((deal: CRMDeal, i: number) => {
          response += `**${i + 1}. ${deal.name}**\n`;
          if (deal.value) response += `   💰 $${deal.value.toLocaleString()}\n`;
          if (deal.stage) response += `   📊 Stage: ${deal.stage}\n`;
          if (deal.company) response += `   🏢 ${deal.company}\n`;
          if (deal.expectedCloseDate) response += `   📅 Close: ${new Date(deal.expectedCloseDate).toLocaleDateString()}\n`;
          response += `\n`;
        });

        response += `Would you like me to update any of these deals or schedule a follow-up?`;
        return response;
      }

      if (intent.action === "create_contact" && data?.created) {
        return `✅ Contact "${data.created.name}" has been added to your CRM. Would you like me to create a deal or task for this contact?`;
      }

      if (intent.action === "create_deal" && data?.created) {
        return `✅ Deal "${data.created.name}" has been created. Would you like me to set a reminder or add notes?`;
      }

      return "I've processed your CRM request. What else would you like me to help with?";
    } catch (err) {
      console.error("CRM action failed:", err);
      return `I encountered an issue accessing your CRM: ${err instanceof Error ? err.message : "Unknown error"}. Please check your connection in Automations.`;
    } finally {
      setIsLoading(false);
    }
  }, [checkConnectedCRMs]);

  // Generate context for VOPSy prompt
  const getCRMContext = useCallback(() => {
    if (!crmSummary && !searchResults) return null;

    let context = "CRM Context:\n";
    
    if (connectedCRMs.length > 0) {
      context += `Connected CRMs: ${connectedCRMs.join(", ")}\n`;
    }

    if (crmSummary) {
      context += `Active CRM: ${crmSummary.providerName}\n`;
      context += `Total Contacts: ${crmSummary.totalContacts}\n`;
      context += `Open Deals: ${crmSummary.openDeals}\n`;
      context += `Pipeline Value: $${crmSummary.pipelineValue.toLocaleString()}\n`;
    }

    if (searchResults?.contacts?.length) {
      context += `Last Contact Search Results: ${searchResults.contacts.length} contacts found\n`;
    }

    if (searchResults?.deals?.length) {
      context += `Last Deal Search Results: ${searchResults.deals.length} deals found\n`;
    }

    return context;
  }, [crmSummary, searchResults, connectedCRMs]);

  return {
    isLoading,
    crmSummary,
    searchResults,
    connectedCRMs,
    checkConnectedCRMs,
    parseCRMIntent,
    executeCRMAction,
    getCRMContext,
  };
}
