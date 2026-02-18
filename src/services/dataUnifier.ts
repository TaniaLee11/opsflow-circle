// src/services/dataUnifier.ts
// Unified data layer — merges data from ALL connected OAuth sources

export interface UnifiedContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  sources: SourceBadge[];
  sourceData: Record<string, any>;
  lastActivity?: Date;
  tags: string[];
}

export interface UnifiedTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category?: string;
  sources: SourceBadge[];
  sourceData: Record<string, any>;
}

export interface UnifiedDeal {
  id: string;
  title: string;
  value: number;
  stage: string;
  contactName?: string;
  sources: SourceBadge[];
  sourceData: Record<string, any>;
}

export interface SourceBadge {
  provider: string;
  providerId: string;
  label: string;
  icon: string;
}

// Financial providers supported
export const FINANCIAL_PROVIDERS = [
  { id: 'quickbooks', name: 'QuickBooks', category: 'accounting' },
  { id: 'wave', name: 'Wave', category: 'accounting' },
  { id: 'xero', name: 'Xero', category: 'accounting' },
  { id: 'freshbooks', name: 'FreshBooks', category: 'accounting' },
  { id: 'stripe', name: 'Stripe', category: 'payments' },
  { id: 'square', name: 'Square', category: 'payments' },
  { id: 'chime', name: 'Chime', category: 'banking' },
  { id: 'robinhood', name: 'Robinhood', category: 'investing' },
  { id: 'plaid', name: 'Plaid', category: 'banking' },
  { id: 'mercury', name: 'Mercury', category: 'banking' },
  { id: 'relay', name: 'Relay', category: 'banking' },
];

export function providerIcon(provider: string): string {
  const icons: Record<string, string> = {
    ghl: '🟢',
    quickbooks: '📊',
    gmail: '✉️',
    google_contacts: '👤',
    google_calendar: '📅',
    stripe: '💳',
    wave: '🌊',
    xero: '📘',
    freshbooks: '📗',
    square: '⬛',
    chime: '🏦',
    robinhood: '🪶',
    plaid: '🔗',
    mercury: '☿',
    relay: '⚡',
  };
  return icons[provider] || '🔗';
}

export function providerLabel(provider: string): string {
  const labels: Record<string, string> = {
    ghl: 'GHL',
    quickbooks: 'QBO',
    gmail: 'Gmail',
    google_contacts: 'Google',
    google_calendar: 'Calendar',
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

// Deduplicate contacts by email (primary key)
export function deduplicateContacts(
  sources: { provider: string; contacts: any[] }[]
): UnifiedContact[] {
  const emailMap = new Map<string, UnifiedContact>();
  const noEmailContacts: UnifiedContact[] = [];

  for (const source of sources) {
    for (const contact of source.contacts) {
      const email = contact.email?.toLowerCase()?.trim();

      if (!email) {
        // No email — try matching by phone or company name
        const existing = findByPhoneOrName(noEmailContacts, contact);
        if (existing) {
          mergeIntoExisting(existing, contact, source.provider);
        } else {
          noEmailContacts.push(createNewContact(contact, source.provider));
        }
        continue;
      }

      if (emailMap.has(email)) {
        // EXISTS — merge data from this source
        const existing = emailMap.get(email)!;
        mergeIntoExisting(existing, contact, source.provider);
      } else {
        // NEW — create unified contact
        emailMap.set(email, createNewContact(contact, source.provider));
      }
    }
  }

  return [...Array.from(emailMap.values()), ...noEmailContacts];
}

function findByPhoneOrName(
  contacts: UnifiedContact[],
  contact: any
): UnifiedContact | undefined {
  if (contact.phone) {
    return contacts.find((c) => c.phone === contact.phone);
  }
  if (contact.company) {
    return contacts.find(
      (c) =>
        c.company?.toLowerCase() === contact.company?.toLowerCase()
    );
  }
  return undefined;
}

function createNewContact(contact: any, provider: string): UnifiedContact {
  return {
    id: crypto.randomUUID(),
    name: contact.name || contact.firstName + ' ' + contact.lastName || 'Unknown',
    email: contact.email?.toLowerCase()?.trim() || '',
    phone: contact.phone,
    company: contact.company || contact.companyName,
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

function mergeIntoExisting(
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
  if (!existing.company && contact.company)
    existing.company = contact.company || contact.companyName;

  // Use most complete name
  const contactName = contact.name || contact.firstName + ' ' + contact.lastName;
  if (contactName && contactName.length > existing.name.length) {
    existing.name = contactName;
  }

  // Merge tags
  if (contact.tags) {
    existing.tags = [...new Set([...existing.tags, ...contact.tags])];
  }

  // Store raw source data
  existing.sourceData[provider] = contact;

  // Use most recent activity
  if (contact.lastActivity) {
    const activityDate = new Date(contact.lastActivity);
    if (!existing.lastActivity || activityDate > existing.lastActivity) {
      existing.lastActivity = activityDate;
    }
  }
}

// Deduplicate transactions by amount + date + description (fuzzy match)
export function deduplicateTransactions(
  sources: { provider: string; transactions: any[] }[]
): UnifiedTransaction[] {
  const seen = new Map<string, UnifiedTransaction>();

  for (const source of sources) {
    for (const txn of source.transactions) {
      // Generate fuzzy match key: amount + date + first 20 chars of description
      const key = `${txn.amount}-${txn.date}-${txn.description
        ?.substring(0, 20)
        ?.toLowerCase()}`;

      if (seen.has(key)) {
        // Likely same transaction from another source — add source badge
        seen.get(key)!.sources.push({
          provider: source.provider,
          providerId: txn.id,
          label: providerLabel(source.provider),
          icon: providerIcon(source.provider),
        });
        // Merge source data
        seen.get(key)!.sourceData[source.provider] = txn;
      } else {
        seen.set(key, {
          id: crypto.randomUUID(),
          date: txn.date,
          amount: txn.amount,
          description: txn.description,
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

  return Array.from(seen.values());
}

// Deduplicate deals/opportunities
export function deduplicateDeals(
  sources: { provider: string; deals: any[] }[]
): UnifiedDeal[] {
  const titleMap = new Map<string, UnifiedDeal>();

  for (const source of sources) {
    for (const deal of source.deals) {
      const title = deal.title?.toLowerCase()?.trim() || deal.name?.toLowerCase()?.trim();

      if (!title) continue;

      if (titleMap.has(title)) {
        // EXISTS — merge
        const existing = titleMap.get(title)!;
        existing.sources.push({
          provider: source.provider,
          providerId: deal.id,
          label: providerLabel(source.provider),
          icon: providerIcon(source.provider),
        });
        existing.sourceData[source.provider] = deal;
      } else {
        // NEW
        titleMap.set(title, {
          id: crypto.randomUUID(),
          title: deal.title || deal.name,
          value: deal.value || deal.amount || 0,
          stage: deal.stage || deal.status,
          contactName: deal.contactName || deal.customerName,
          sources: [
            {
              provider: source.provider,
              providerId: deal.id,
              label: providerLabel(source.provider),
              icon: providerIcon(source.provider),
            },
          ],
          sourceData: { [source.provider]: deal },
        });
      }
    }
  }

  return Array.from(titleMap.values());
}
