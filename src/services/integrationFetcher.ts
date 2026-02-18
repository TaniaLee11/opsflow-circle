// src/services/integrationFetcher.ts
// Fetches data from ALL connected OAuth integrations

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export interface Integration {
  id: string;
  user_id: string;
  provider: string;
  status: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
}

// Get all active integrations for a user
export async function getUserIntegrations(
  userId: string
): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching integrations:', error);
    return [];
  }

  return data || [];
}

// Fetch contacts from ALL connected sources
export async function fetchAllContacts(
  userId: string,
  userRole: string
): Promise<{ provider: string; contacts: any[] }[]> {
  const integrations = await getUserIntegrations(userId);
  const sources: { provider: string; contacts: any[] }[] = [];

  for (const integration of integrations) {
    try {
      const token = await getValidToken(integration);

      switch (integration.provider) {
        case 'ghl':
          const ghlContacts = await fetchGHLContacts(token);
          sources.push({ provider: 'ghl', contacts: ghlContacts });
          break;

        case 'quickbooks':
          const qboCustomers = await fetchQBOCustomers(token);
          sources.push({ provider: 'quickbooks', contacts: qboCustomers });
          break;

        case 'google':
          const googleContacts = await fetchGoogleContacts(token);
          sources.push({ provider: 'google_contacts', contacts: googleContacts });

          const gmailSenders = await fetchGmailFrequentSenders(token);
          sources.push({ provider: 'gmail', contacts: gmailSenders });
          break;
      }
    } catch (error) {
      console.error(`Error fetching from ${integration.provider}:`, error);
    }
  }

  // FOR OWNER: also include platform GHL data
  if (userRole === 'owner') {
    try {
      const platformContacts = await fetchPlatformGHLContacts();
      sources.push({ provider: 'ghl', contacts: platformContacts });
    } catch (error) {
      console.error('Error fetching platform GHL contacts:', error);
    }
  }

  return sources;
}

// Fetch transactions from ALL connected financial sources
export async function fetchAllTransactions(
  userId: string
): Promise<{ provider: string; transactions: any[] }[]> {
  const integrations = await getUserIntegrations(userId);
  const sources: { provider: string; transactions: any[] }[] = [];

  for (const integration of integrations) {
    // Only fetch from financial providers
    if (!isFinancialProvider(integration.provider)) continue;

    try {
      const token = await getValidToken(integration);

      switch (integration.provider) {
        case 'quickbooks':
          const qboTxns = await fetchQBOTransactions(token);
          sources.push({ provider: 'quickbooks', transactions: qboTxns });
          break;

        case 'stripe':
          const stripeTxns = await fetchStripeTransactions(token);
          sources.push({ provider: 'stripe', transactions: stripeTxns });
          break;

        case 'wave':
          const waveTxns = await fetchWaveTransactions(token);
          sources.push({ provider: 'wave', transactions: waveTxns });
          break;

        case 'xero':
          const xeroTxns = await fetchXeroTransactions(token);
          sources.push({ provider: 'xero', transactions: xeroTxns });
          break;
      }
    } catch (error) {
      console.error(`Error fetching transactions from ${integration.provider}:`, error);
    }
  }

  return sources;
}

// Fetch deals/opportunities from ALL connected sources
export async function fetchAllDeals(
  userId: string,
  userRole: string
): Promise<{ provider: string; deals: any[] }[]> {
  const integrations = await getUserIntegrations(userId);
  const sources: { provider: string; deals: any[] }[] = [];

  for (const integration of integrations) {
    try {
      const token = await getValidToken(integration);

      switch (integration.provider) {
        case 'ghl':
          const ghlOpps = await fetchGHLOpportunities(token);
          sources.push({ provider: 'ghl', deals: ghlOpps });
          break;

        case 'quickbooks':
          const qboInvoices = await fetchQBOInvoices(token);
          // Map unpaid invoices to deals
          const qboDeals = qboInvoices
            .filter((inv: any) => inv.Balance > 0)
            .map((inv: any) => ({
              id: inv.Id,
              title: `Invoice ${inv.DocNumber}`,
              value: inv.Balance,
              stage: 'pending',
              contactName: inv.CustomerRef?.name,
            }));
          sources.push({ provider: 'quickbooks', deals: qboDeals });
          break;

        case 'stripe':
          const stripePending = await fetchStripePendingPayments(token);
          sources.push({ provider: 'stripe', deals: stripePending });
          break;
      }
    } catch (error) {
      console.error(`Error fetching deals from ${integration.provider}:`, error);
    }
  }

  // FOR OWNER: also include platform GHL opportunities
  if (userRole === 'owner') {
    try {
      const platformOpps = await fetchPlatformGHLOpportunities();
      sources.push({ provider: 'ghl', deals: platformOpps });
    } catch (error) {
      console.error('Error fetching platform GHL opportunities:', error);
    }
  }

  return sources;
}

// Helper: Check if provider is financial
function isFinancialProvider(provider: string): boolean {
  const financialProviders = [
    'quickbooks',
    'wave',
    'xero',
    'freshbooks',
    'stripe',
    'square',
    'chime',
    'robinhood',
    'plaid',
    'mercury',
    'relay',
  ];
  return financialProviders.includes(provider);
}

// Helper: Get valid token (refresh if expired)
async function getValidToken(integration: Integration): Promise<string> {
  if (!integration.access_token) {
    throw new Error('No access token available');
  }

  // Check if token is expired
  if (integration.expires_at) {
    const expiresAt = new Date(integration.expires_at);
    const now = new Date();

    if (expiresAt <= now) {
      // Token expired — refresh it
      const newToken = await refreshToken(integration);
      return newToken;
    }
  }

  return integration.access_token;
}

// Helper: Refresh OAuth token
async function refreshToken(integration: Integration): Promise<string> {
  const response = await fetch('/api/oauth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: integration.provider,
      refreshToken: integration.refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  return data.access_token;
}

// Platform GHL contacts (owner's data)
async function fetchPlatformGHLContacts(): Promise<any[]> {
  const response = await fetch('/api/ghl-contacts');
  if (!response.ok) throw new Error('Failed to fetch platform GHL contacts');
  const data = await response.json();
  return data.contacts || [];
}

// Platform GHL opportunities (owner's data)
async function fetchPlatformGHLOpportunities(): Promise<any[]> {
  const response = await fetch('/api/ghl-opportunities');
  if (!response.ok) throw new Error('Failed to fetch platform GHL opportunities');
  const data = await response.json();
  return data.opportunities || [];
}

// GHL contacts (user's own GHL connection)
async function fetchGHLContacts(token: string): Promise<any[]> {
  const response = await fetch('/api/integrations/ghl/contacts', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch GHL contacts');
  const data = await response.json();
  return data.contacts || [];
}

// GHL opportunities (user's own GHL connection)
async function fetchGHLOpportunities(token: string): Promise<any[]> {
  const response = await fetch('/api/integrations/ghl/opportunities', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch GHL opportunities');
  const data = await response.json();
  return data.opportunities || [];
}

// QuickBooks customers
async function fetchQBOCustomers(token: string): Promise<any[]> {
  const response = await fetch('/api/integrations/quickbooks/customers', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch QBO customers');
  const data = await response.json();
  return data.customers || [];
}

// QuickBooks transactions
async function fetchQBOTransactions(token: string): Promise<any[]> {
  const response = await fetch('/api/integrations/quickbooks/transactions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch QBO transactions');
  const data = await response.json();
  return data.transactions || [];
}

// QuickBooks invoices
async function fetchQBOInvoices(token: string): Promise<any[]> {
  const response = await fetch('/api/integrations/quickbooks/invoices', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch QBO invoices');
  const data = await response.json();
  return data.invoices || [];
}

// Stripe transactions
async function fetchStripeTransactions(token: string): Promise<any[]> {
  const response = await fetch('/api/integrations/stripe/transactions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch Stripe transactions');
  const data = await response.json();
  return data.transactions || [];
}

// Stripe pending payments
async function fetchStripePendingPayments(token: string): Promise<any[]> {
  const response = await fetch('/api/integrations/stripe/pending', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch Stripe pending payments');
  const data = await response.json();
  return data.pending || [];
}

// Wave transactions
async function fetchWaveTransactions(token: string): Promise<any[]> {
  // Placeholder — implement when Wave OAuth is added
  return [];
}

// Xero transactions
async function fetchXeroTransactions(token: string): Promise<any[]> {
  // Placeholder — implement when Xero OAuth is added
  return [];
}

// Google Contacts
async function fetchGoogleContacts(token: string): Promise<any[]> {
  const response = await fetch('/api/integrations/google/contacts', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch Google contacts');
  const data = await response.json();
  return data.contacts || [];
}

// Gmail frequent senders
async function fetchGmailFrequentSenders(token: string): Promise<any[]> {
  const response = await fetch('/api/integrations/google/gmail-senders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch Gmail senders');
  const data = await response.json();
  return data.senders || [];
}
