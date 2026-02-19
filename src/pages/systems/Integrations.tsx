import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/glass-card';
import { Navigation } from '../../components/layout/Navigation';
import { Check, X, RefreshCw } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: 'accounting' | 'payment' | 'banking' | 'email_calendar' | 'storage';
  icon: string;
  connected: boolean;
  lastSync?: string;
  description: string;
  feeds: string[]; // What pages this integration feeds data to
}

const INTEGRATION_CATALOG: Omit<Integration, 'connected' | 'lastSync'>[] = [
  // ACCOUNTING SOFTWARE
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    category: 'accounting',
    icon: '💰',
    description: 'Cloud-based accounting software',
    feeds: ['Banking', 'Cash Flow', 'Reconciliation', 'Tax Organizer', 'Reports']
  },
  {
    id: 'wave',
    name: 'Wave',
    category: 'accounting',
    icon: '🌊',
    description: 'Free accounting software for small businesses',
    feeds: ['Banking', 'Cash Flow', 'Reconciliation', 'Tax Organizer', 'Reports']
  },
  {
    id: 'xero',
    name: 'Xero',
    category: 'accounting',
    icon: '📊',
    description: 'Beautiful accounting software',
    feeds: ['Banking', 'Cash Flow', 'Reconciliation', 'Tax Organizer', 'Reports']
  },
  {
    id: 'freshbooks',
    name: 'FreshBooks',
    category: 'accounting',
    icon: '📚',
    description: 'Invoicing and accounting for small businesses',
    feeds: ['Banking', 'Cash Flow', 'Reconciliation', 'Tax Organizer', 'Reports']
  },
  {
    id: 'sage',
    name: 'Sage Business Cloud',
    category: 'accounting',
    icon: '🌿',
    description: 'Accounting, payroll, and payments',
    feeds: ['Banking', 'Cash Flow', 'Reconciliation', 'Tax Organizer', 'Reports']
  },
  
  // PAYMENT PROCESSORS
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payment',
    icon: '💳',
    description: 'Online payment processing',
    feeds: ['Cash Flow', 'Banking', 'Revenue tracking']
  },
  {
    id: 'square',
    name: 'Square',
    category: 'payment',
    icon: '⬜',
    description: 'Point of sale and payment processing',
    feeds: ['Cash Flow', 'Banking', 'Revenue tracking']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'payment',
    icon: '🅿️',
    description: 'Online payment platform',
    feeds: ['Cash Flow', 'Banking', 'Revenue tracking']
  },
  
  // BANKING
  {
    id: 'plaid',
    name: 'Plaid',
    category: 'banking',
    icon: '🏦',
    description: 'Direct bank feed connections',
    feeds: ['Banking', 'Cash Flow', 'Reconciliation']
  },
  
  // EMAIL & CALENDAR
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    category: 'email_calendar',
    icon: '📧',
    description: 'Gmail, Calendar, Drive, Contacts',
    feeds: ['Calendar', 'Inbox', 'Contacts', 'Vault']
  },
  {
    id: 'microsoft_365',
    name: 'Microsoft 365',
    category: 'email_calendar',
    icon: '📨',
    description: 'Outlook, Calendar, OneDrive, Contacts',
    feeds: ['Calendar', 'Inbox', 'Contacts', 'Vault']
  },
  {
    id: 'outlook',
    name: 'Outlook',
    category: 'email_calendar',
    icon: '📮',
    description: 'Email and calendar',
    feeds: ['Calendar', 'Inbox', 'Contacts']
  },
  
  // CRM & MARKETING
  // Note: GoHighLevel is platform infrastructure, not a user integration
  // It's always active and feeding data to Contacts, Pipeline, Inbox, Campaigns, Audience
  
  // STORAGE
  {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'storage',
    icon: '📁',
    description: 'Cloud file storage and sharing',
    feeds: ['Vault']
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'storage',
    icon: '📦',
    description: 'Cloud storage and file sync',
    feeds: ['Vault']
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    category: 'storage',
    icon: '☁️',
    description: 'Microsoft cloud storage',
    feeds: ['Vault']
  }
];

const CATEGORY_LABELS = {
  accounting: 'Accounting Software',
  payment: 'Payment Processors',
  banking: 'Banking',
  email_calendar: 'Email & Calendar',
  storage: 'Storage'
};

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      
      // Get user ID from context/session
      const userResponse = await fetch('/api/auth/session');
      const userData = await userResponse.json();
      const userId = userData?.user?.id;
      
      if (!userId) {
        console.error('No user ID found');
        // Still show catalog, just mark all as disconnected
        setIntegrations(INTEGRATION_CATALOG.map(int => ({ ...int, connected: false })));
        setLoading(false);
        return;
      }
      
      // Fetch user's integrations from database
      const response = await fetch(`/api/user-integrations?userId=${userId}`);
      const data = await response.json();
      const userIntegrations = data.integrations || [];
      
      // Create a map of connected integrations
      const connectedMap = new Map(
        userIntegrations.map((int: any) => [int.integration_id, int])
      );
      
      // Map catalog to include connection status
      const mappedIntegrations: Integration[] = INTEGRATION_CATALOG.map(int => ({
        ...int,
        connected: connectedMap.has(int.id),
        lastSync: connectedMap.get(int.id)?.last_sync
      }));
      
      setIntegrations(mappedIntegrations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setIntegrations(INTEGRATION_CATALOG.map(int => ({ ...int, connected: false })));
      setLoading(false);
    }
  };

  const handleConnect = async (integrationId: string) => {
    try {
      // Get user ID from context/session
      const userResponse = await fetch('/api/auth/session');
      const userData = await userResponse.json();
      const userId = userData?.user?.id;
      
      if (!userId) {
        alert('Please log in to connect integrations');
        return;
      }
      
      // Save connection to database
      const response = await fetch('/api/user-integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          integrationId,
          action: 'connect'
        })
      });
      
      if (response.ok) {
        // Refresh integrations list
        fetchIntegrations();
      } else {
        alert('Failed to connect integration');
      }
    } catch (error) {
      console.error('Error connecting integration:', error);
      alert('Failed to connect integration');
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      // Get user ID from context/session
      const userResponse = await fetch('/api/auth/session');
      const userData = await userResponse.json();
      const userId = userData?.user?.id;
      
      if (!userId) {
        alert('Please log in to disconnect integrations');
        return;
      }
      
      // Remove connection from database
      const response = await fetch('/api/user-integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          integrationId,
          action: 'disconnect'
        })
      });
      
      if (response.ok) {
        // Refresh integrations list
        fetchIntegrations();
      } else {
        alert('Failed to disconnect integration');
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      alert('Failed to disconnect integration');
    }
  };

  const filteredIntegrations = integrations.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         int.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || int.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = integrations.filter(int => int.connected).length;
  const availableCount = integrations.length;

  // Group integrations by category
  const groupedIntegrations = Object.keys(CATEGORY_LABELS).reduce((acc, category) => {
    acc[category] = filteredIntegrations.filter(int => int.category === category);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <>
      <Navigation />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Integrations</h1>
            <p className="text-muted-foreground">
              Connect your business tools to unlock the platform's full intelligence
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="text-4xl font-bold text-primary">{connectedCount}</div>
              <div className="text-sm text-muted-foreground mt-1">Connected</div>
            </GlassCard>
            <GlassCard className="p-6">
              <div className="text-4xl font-bold text-primary">{availableCount - connectedCount}</div>
              <div className="text-sm text-muted-foreground mt-1">Available</div>
            </GlassCard>
            <GlassCard className="p-6">
              <div className="text-4xl font-bold text-primary">{availableCount}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Integrations</div>
            </GlassCard>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-8">
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                }`}
              >
                All
              </button>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterCategory(key)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterCategory === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Integration Catalog by Category */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              Loading integrations...
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => {
                if (categoryIntegrations.length === 0) return null;
                
                return (
                  <div key={category}>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryIntegrations.map((integration) => (
                        <GlassCard key={integration.id} className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">{integration.icon}</div>
                              <div>
                                <h3 className="font-semibold text-foreground">{integration.name}</h3>
                                {integration.connected && (
                                  <span className="text-xs text-green-500 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Connected
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">
                            {integration.description}
                          </p>
                          
                          <div className="mb-4">
                            <div className="text-xs text-muted-foreground mb-2">Feeds:</div>
                            <div className="flex flex-wrap gap-1">
                              {integration.feeds.map((feed) => (
                                <span
                                  key={feed}
                                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                                >
                                  {feed}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {integration.connected ? (
                            <button
                              onClick={() => handleDisconnect(integration.id)}
                              className="w-full px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Disconnect
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConnect(integration.id)}
                              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                              Connect
                            </button>
                          )}
                          
                          {integration.lastSync && (
                            <div className="text-xs text-muted-foreground mt-2">
                              Last synced: {new Date(integration.lastSync).toLocaleString()}
                            </div>
                          )}
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
