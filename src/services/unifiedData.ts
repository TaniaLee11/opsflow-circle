// Unified Data Layer: Merge data from ALL connected OAuth sources
// Deduplicates contacts, transactions, emails across GHL, QuickBooks, Google, Stripe, etc.

// import { supabase } from '@/lib/supabase'; // Not needed yet

// ============================================================================
// TYPES
// ============================================================================

export interface UnifiedContact {
  id: string;                    // generated UUID
  name: string;                  // best available name
  email: string;                 // primary dedup key
  phone?: string;
  company?: string;
  sources: SourceBadge[];        // which integrations have this contact
  sourceData: Record<string, any>; // raw data per source
  lastActivity?: Date;
  tags: string[];
}

export interface SourceBadge {
  provider: string;              // 'ghl', 'quickbooks', 'gmail', 'google_contacts'
  providerId: string;            // their ID in that system
  label: string;                 // display label
  icon: string;                  // emoji or icon
}

export interface UnifiedTransaction {
  id: string;
  amount: number;
  date: Date;
  description: string;
  category?: string;
  sources: SourceBadge[];
  sourceData: Record<string, any>;
}

export interface UnifiedEmail {
  id: string;
  subject: string;
  from: string;
  date: Date;
  snippet: string;
  sources: SourceBadge[];
  sourceData: Record<string, any>;
}

// ============================================================================
// PROVIDER LABELS & ICONS
// ============================================================================

function providerLabel(provider: string): string {
  const labels: Record<string, string> = {
    ghl: 'GHL',
    quickbooks: 'QuickBooks',
    gmail: 'Gmail',
    google_contacts: 'Google Contacts',
    stripe: 'Stripe',
    wave: 'Wave',
    xero: 'Xero',
    freshbooks: 'FreshBooks',
    square: 'Square',
    chime: 'Chime',
    robinhood: 'Robinhood',
    plaid: 'Plaid',
    mercury: 'Mercury',
    relay: 'Relay',
  };
  return labels[provider] || provider;
}

function providerIcon(provider: string): string {
  const icons: Record<string, string> = {
    ghl: '🟢',
    quickbooks: '📊',
    gmail: '✉️',
    google_contacts: '👤',
    stripe: '💳',
    wave: '🌊',
    xero: '📈',
    freshbooks: '📗',
    square: '⬛',
    chime: '🔔',
    robinhood: '🏹',
    plaid: '🏦',
    mercury: '☿️',
    relay: '🔄',
  };
  return icons[provider] || '🔗';
}

// ============================================================================
// CONTACT DEDUPLICATION
// ============================================================================

export function deduplicateContacts(
  sources: { provider: string; contacts: any[] }[]
): UnifiedContact[] {
  const emailMap = new Map<string, UnifiedContact>();
  const phoneMap = new Map<string, UnifiedContact>();

  for (const source of sources) {
    for (const contact of source.contacts) {
      const email = contact.email?.toLowerCase()?.trim();
      const phone = contact.phone?.replace(/\D/g, ''); // normalize phone

      if (email && emailMap.has(email)) {
        // EXISTS by email — merge
        const existing = emailMap.get(email)!;
        mergeContactIntoExisting(existing, contact, source.provider);
      } else if (phone && phoneMap.has(phone)) {
        // EXISTS by phone — merge
        const existing = phoneMap.get(phone)!;
        mergeContactIntoExisting(existing, contact, source.provider);
      } else {
        // NEW contact
        const unified = createUnifiedContact(contact, source.provider);
        if (email) emailMap.set(email, unified);
        if (phone) phoneMap.set(phone, unified);
      }
    }
  }

  return Array.from(emailMap.values());
}

function createUnifiedContact(contact: any, provider: string): UnifiedContact {
  return {
    id: crypto.randomUUID(),
    name: contact.name || contact.fullName || 'Unknown',
    email: contact.email || '',
    phone: contact.phone || '',
    company: contact.company || contact.companyName || '',
    sources: [
      {
        provider,
        providerId: contact.id,
        label: providerLabel(provider),
        icon: providerIcon(provider),
      },
    ],
    sourceData: { [provider]: contact },
    lastActivity: contact.lastActivity ? new Date(contact.lastActivity) : undefined,
    tags: contact.tags || [],
  };
}

function mergeContactIntoExisting(
  existing: UnifiedContact,
  contact: any,
  provider: string
) {
  // Add source badge
  existing.sources.push({
    provider,
    providerId: contact.id,
    label: providerLabel(provider),
    icon: providerIcon(provider),
  });

  // Fill in missing data (don't overwrite existing)
  if (!existing.phone && contact.phone) existing.phone = contact.phone;
  if (!existing.company && contact.company) existing.company = contact.company;

  // Use most complete name
  if (contact.name && contact.name.length > existing.name.length) {
    existing.name = contact.name;
  }

  // Merge tags
  if (contact.tags) {
    existing.tags = [...new Set([...existing.tags, ...contact.tags])];
  }

  // Store raw source data
  existing.sourceData[provider] = contact;

  // Update last activity if newer
  if (contact.lastActivity) {
    const contactDate = new Date(contact.lastActivity);
    if (!existing.lastActivity || contactDate > existing.lastActivity) {
      existing.lastActivity = contactDate;
    }
  }
}

// ============================================================================
// TRANSACTION DEDUPLICATION
// ============================================================================

export function deduplicateTransactions(
  sources: { provider: string; transactions: any[] }[]
): UnifiedTransaction[] {
  const transactionMap = new Map<string, UnifiedTransaction>();

  for (const source of sources) {
    for (const txn of source.transactions) {
      // Dedup key: amount + date + description (fuzzy match)
      const key = `${txn.amount}_${txn.date}_${txn.description?.toLowerCase().slice(0, 20)}`;

      if (transactionMap.has(key)) {
        // EXISTS — merge
        const existing = transactionMap.get(key)!;
        existing.sources.push({
          provider: source.provider,
          providerId: txn.id,
          label: providerLabel(source.provider),
          icon: providerIcon(source.provider),
        });
        existing.sourceData[source.provider] = txn;
      } else {
        // NEW transaction
        transactionMap.set(key, {
          id: crypto.randomUUID(),
          amount: txn.amount,
          date: new Date(txn.date),
          description: txn.description || '',
          category: txn.category,
          sources: [
            {
              provider: source.provider,
              providerId: txn.id,
              label: providerLabel(source.provider),
              icon: providerIcon(source.provider),
            },
          ],
          sourceData: { [source.provider]: txn },
        });
      }
    }
  }

  return Array.from(transactionMap.values());
}

// ============================================================================
// EMAIL DEDUPLICATION
// ============================================================================

export function deduplicateEmails(
  sources: { provider: string; emails: any[] }[]
): UnifiedEmail[] {
  const emailMap = new Map<string, UnifiedEmail>();

  for (const source of sources) {
    for (const email of source.emails) {
      // Dedup key: subject + date (exact match)
      const key = `${email.subject}_${email.date}`;

      if (emailMap.has(key)) {
        // EXISTS — merge
        const existing = emailMap.get(key)!;
        existing.sources.push({
          provider: source.provider,
          providerId: email.id,
          label: providerLabel(source.provider),
          icon: providerIcon(source.provider),
        });
        existing.sourceData[source.provider] = email;
      } else {
        // NEW email
        emailMap.set(key, {
          id: crypto.randomUUID(),
          subject: email.subject || '',
          from: email.from || '',
          date: new Date(email.date),
          snippet: email.snippet || email.body?.slice(0, 200) || '',
          sources: [
            {
              provider: source.provider,
              providerId: email.id,
              label: providerLabel(source.provider),
              icon: providerIcon(source.provider),
            },
          ],
          sourceData: { [source.provider]: email },
        });
      }
    }
  }

  return Array.from(emailMap.values());
}

// ============================================================================
// FETCH ALL CONNECTED SOURCES
// ============================================================================

export async function fetchAllContactSources(
  userId: string,
  userRole: string
): Promise<{ provider: string; contacts: any[] }[]> {
  const sources: { provider: string; contacts: any[] }[] = [];

  // 1. Get ALL active integrations for this user
  const { data: integrations } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  // 2. Fetch contacts from EACH connected source
  for (const integration of integrations || []) {
    try {
      const response = await fetch(`/api/integrations/${integration.provider}/contacts`, {
        headers: {
          'x-user-id': userId,
          'x-integration-id': integration.id,
        },
      });
      const data = await response.json();
      if (data.contacts) {
        sources.push({ provider: integration.provider, contacts: data.contacts });
      }
    } catch (error) {
      console.error(`Failed to fetch contacts from ${integration.provider}:`, error);
    }
  }

  // 3. FOR OWNER: also include platform GHL data
  if (userRole === 'owner') {
    try {
      const response = await fetch('/api/ghl-contacts');
      const data = await response.json();
      if (data.contacts) {
        sources.push({ provider: 'ghl', contacts: data.contacts });
      }
    } catch (error) {
      console.error('Failed to fetch platform GHL contacts:', error);
    }
  }

  return sources;
}

export async function fetchAllTransactionSources(
  userId: string
): Promise<{ provider: string; transactions: any[] }[]> {
  const sources: { provider: string; transactions: any[] }[] = [];

  const { data: integrations } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .in('provider', ['quickbooks', 'wave', 'xero', 'freshbooks', 'stripe', 'square', 'chime', 'plaid', 'mercury', 'relay']);

  for (const integration of integrations || []) {
    try {
      const response = await fetch(`/api/integrations/${integration.provider}/transactions`, {
        headers: {
          'x-user-id': userId,
          'x-integration-id': integration.id,
        },
      });
      const data = await response.json();
      if (data.transactions) {
        sources.push({ provider: integration.provider, transactions: data.transactions });
      }
    } catch (error) {
      console.error(`Failed to fetch transactions from ${integration.provider}:`, error);
    }
  }

  return sources;
}
