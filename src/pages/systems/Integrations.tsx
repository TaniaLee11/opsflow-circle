import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/glass-card';
import { Navigation } from '../../components/layout/Navigation';

interface Integration {
  id: string;
  name: string;
  category: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  description: string;
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

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
      
      // Define all available integrations
      const mappedIntegrations: Integration[] = [
        {
          id: 'ghl',
          name: 'GoHighLevel',
          category: 'CRM',
          icon: '🎯',
          connected: connectedMap.has('ghl'),
          lastSync: connectedMap.get('ghl')?.last_sync,
          description: 'All-in-one marketing and CRM platform'
        },
        {
          id: 'google',
          name: 'Google Workspace',
          category: 'Productivity',
          icon: '📧',
          connected: connectedMap.has('google'),
          lastSync: connectedMap.get('google')?.last_sync,
          description: 'Gmail, Calendar, Drive, and more'
        },
        {
          id: 'facebook',
          name: 'Facebook Ads',
          category: 'Marketing',
          icon: '📘',
          connected: connectedMap.has('facebook'),
          lastSync: connectedMap.get('facebook')?.last_sync,
          description: 'Facebook advertising and analytics'
        },
        {
          id: 'quickbooks',
          name: 'QuickBooks',
          category: 'Finance',
          icon: '💰',
          connected: connectedMap.has('quickbooks'),
          lastSync: connectedMap.get('quickbooks')?.last_sync,
          description: 'Accounting and financial management'
        },
        {
          id: 'tiktok',
          name: 'TikTok Ads',
          category: 'Marketing',
          icon: '🎵',
          connected: connectedMap.has('tiktok'),
          lastSync: connectedMap.get('tiktok')?.last_sync,
          description: 'TikTok advertising platform'
        },
        {
          id: 'ga4',
          name: 'Google Analytics 4',
          category: 'Analytics',
          icon: '📊',
          connected: connectedMap.has('ga4'),
          lastSync: connectedMap.get('ga4')?.last_sync,
          description: 'Website and app analytics'
        },
        {
          id: 'zapier',
          name: 'Zapier',
          category: 'Automation',
          icon: '⚡',
          connected: false,
          description: 'Workflow automation platform'
        },
        {
          id: 'stripe',
          name: 'Stripe',
          category: 'Finance',
          icon: '💳',
          connected: false,
          description: 'Payment processing'
        }
      ];
      
      setIntegrations(mappedIntegrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      // Set default integrations on error
      setIntegrations([
        {
          id: 'ghl',
          name: 'GoHighLevel',
          category: 'CRM',
          icon: '🎯',
          connected: false,
          description: 'All-in-one marketing and CRM platform'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'CRM', 'Marketing', 'Finance', 'Analytics', 'Productivity', 'Automation'];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = integrations.filter(i => i.connected).length;

  const handleConnect = async (integrationId: string) => {
    try {
      // Get user ID from context/session
      const userResponse = await fetch('/api/auth/session');
      const userData = await userResponse.json();
      const userId = userData?.user?.id;
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }
      
      const integration = integrations.find(int => int.id === integrationId);
      if (!integration) return;
      
      // Save to database
      const response = await fetch('/api/user-integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          integrationId: integration.id,
          integrationName: integration.name,
          connected: true,
          metadata: { category: integration.category }
        })
      });
      
      if (response.ok) {
        // Update local state
        setIntegrations(integrations.map(int => 
          int.id === integrationId ? { ...int, connected: true, lastSync: new Date().toISOString() } : int
        ));
      }
    } catch (error) {
      console.error('Error connecting integration:', error);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      // Get user ID from context/session
      const userResponse = await fetch('/api/auth/session');
      const userData = await userResponse.json();
      const userId = userData?.user?.id;
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }
      
      // Delete from database
      const response = await fetch(`/api/user-integrations?userId=${userId}&integrationId=${integrationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Update local state
        setIntegrations(integrations.map(int => 
          int.id === integrationId ? { ...int, connected: false, lastSync: undefined } : int
        ));
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Integrations</h1>
        <p className="text-gray-400">Connect your business tools to unlock VOP Sy's full intelligence</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-6">
          <div className="text-4xl font-bold text-cyan-400 mb-2">{connectedCount}</div>
          <div className="text-gray-400">Connected</div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="text-4xl font-bold text-purple-400 mb-2">{integrations.length - connectedCount}</div>
          <div className="text-gray-400">Available</div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="text-4xl font-bold text-orange-400 mb-2">{integrations.length}</div>
          <div className="text-gray-400">Total Integrations</div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filterCategory === category
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Integrations Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="text-gray-400 mt-4">Loading integrations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map(integration => (
            <GlassCard key={integration.id} className="p-6 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{integration.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                    <p className="text-sm text-gray-400">{integration.category}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  integration.connected
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {integration.connected ? '✓ Connected' : 'Not Connected'}
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">{integration.description}</p>
              
              {integration.lastSync && (
                <p className="text-xs text-gray-500 mb-4">Last synced: {integration.lastSync}</p>
              )}
              
              <button
                onClick={() => integration.connected ? handleDisconnect(integration.id) : handleConnect(integration.id)}
                className={`w-full py-2 rounded-lg font-medium transition-all ${
                  integration.connected
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-cyan-500 text-white hover:bg-cyan-600'
                }`}
              >
                {integration.connected ? 'Disconnect' : 'Connect'}
              </button>
            </GlassCard>
          ))}
        </div>
      )}

      {filteredIntegrations.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">No integrations found matching your search.</p>
        </div>
      )}
      </main>
    </div>
  );
}
