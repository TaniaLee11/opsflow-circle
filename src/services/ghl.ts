/**
 * GoHighLevel API Service
 * Uses secure Vercel serverless functions (no direct API key exposure)
 */

interface GHLContact {
  id: string;
  locationId: string;
  firstName?: string;
  lastName?: string;
  contactName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: any[];
  dateAdded?: string;
  dateUpdated?: string;
  source?: string;
  type?: string;
}

interface GHLOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: string;
  monetaryValue?: number;
  contactId?: string;
  assignedTo?: string;
  locationId: string;
  createdAt?: string;
}

interface GHLPipeline {
  id: string;
  name: string;
  stages: Array<{
    id: string;
    name: string;
    position: number;
    showInFunnel?: boolean;
    showInPieChart?: boolean;
  }>;
  dateAdded?: string;
  dateUpdated?: string;
}

interface Integration {
  connected: boolean;
  name: string;
}

class GHLService {
  private baseUrl: string;

  constructor() {
    // Use relative URLs for Vercel serverless functions
    this.baseUrl = '/api';
  }

  /**
   * Make request to serverless API endpoint
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `API Error (${response.status})`);
    }

    return response.json();
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.getContacts(1);
      return { success: true, message: 'Connected to GoHighLevel successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }

  /**
   * Get all contacts
   */
  async getContacts(limit = 100): Promise<GHLContact[]> {
    try {
      const response = await this.request<{ contacts: GHLContact[]; meta: any }>(
        `/ghl-contacts?limit=${limit}`
      );
      return response.contacts || [];
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      return [];
    }
  }

  /**
   * Get contact by ID
   */
  async getContact(contactId: string): Promise<GHLContact | null> {
    try {
      const response = await this.request<{ contact: GHLContact }>(`/ghl-contact?id=${contactId}`);
      return response.contact;
    } catch (error) {
      console.error('Failed to fetch contact:', error);
      return null;
    }
  }

  /**
   * Get all pipelines
   */
  async getPipelines(): Promise<GHLPipeline[]> {
    try {
      const response = await this.request<{ pipelines: GHLPipeline[] }>(`/ghl-pipelines`);
      return response.pipelines || [];
    } catch (error) {
      console.error('Failed to fetch pipelines:', error);
      return [];
    }
  }

  /**
   * Get all opportunities
   */
  async getOpportunities(limit = 100): Promise<GHLOpportunity[]> {
    try {
      const response = await this.request<{ opportunities: GHLOpportunity[]; total: number }>(
        `/ghl-opportunities`,
        {
          method: 'POST',
          body: JSON.stringify({ limit }),
        }
      );
      return response.opportunities || [];
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
      return [];
    }
  }

  /**
   * Get opportunities by pipeline ID
   */
  async getOpportunitiesByPipeline(pipelineId: string): Promise<GHLOpportunity[]> {
    try {
      const response = await this.request<{ opportunities: GHLOpportunity[] }>(
        `/ghl-opportunities`,
        {
          method: 'POST',
          body: JSON.stringify({ pipelineId }),
        }
      );
      return response.opportunities || [];
    } catch (error) {
      console.error('Failed to fetch pipeline opportunities:', error);
      return [];
    }
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats(pipelineId: string): Promise<{
    totalValue: number;
    totalDeals: number;
    wonDeals: number;
    lostDeals: number;
    openDeals: number;
  }> {
    try {
      const opportunities = await this.getOpportunitiesByPipeline(pipelineId);
      
      return {
        totalValue: opportunities.reduce((sum, opp) => sum + (opp.monetaryValue || 0), 0),
        totalDeals: opportunities.length,
        wonDeals: opportunities.filter(opp => opp.status === 'won').length,
        lostDeals: opportunities.filter(opp => opp.status === 'lost').length,
        openDeals: opportunities.filter(opp => opp.status === 'open').length,
      };
    } catch (error) {
      console.error('Failed to calculate pipeline stats:', error);
      return { totalValue: 0, totalDeals: 0, wonDeals: 0, lostDeals: 0, openDeals: 0 };
    }
  }

  /**
   * Get contact count
   */
  async getContactCount(): Promise<number> {
    try {
      const response = await this.request<{ contacts: GHLContact[]; meta: { total: number } }>(
        `/ghl-contacts?limit=1`
      );
      return response.meta?.total || 0;
    } catch (error) {
      console.error('Failed to get contact count:', error);
      return 0;
    }
  }

  /**
   * Get total pipeline value across all pipelines
   */
  async getTotalPipelineValue(): Promise<number> {
    const opportunities = await this.getOpportunities(1000);
    return opportunities.reduce((sum, opp) => sum + (opp.monetaryValue || 0), 0);
  }

  /**
   * Get integrations status
   */
  async getIntegrations(): Promise<Record<string, Integration>> {
    try {
      const response = await this.request<{ integrations: Record<string, Integration> }>(
        `/ghl-integrations`
      );
      return response.integrations || {};
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      return {};
    }
  }

  /**
   * Get contact display name
   */
  getContactName(contact: GHLContact): string {
    if (contact.contactName) return contact.contactName;
    if (contact.firstName && contact.lastName) return `${contact.firstName} ${contact.lastName}`;
    if (contact.firstName) return contact.firstName;
    if (contact.companyName) return contact.companyName;
    return 'Unknown Contact';
  }
}

// Export singleton instance
export const ghlService = new GHLService();

// Export types
export type { GHLContact, GHLOpportunity, GHLPipeline, Integration };
