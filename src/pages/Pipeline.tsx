import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { fetchAllDeals } from '@/services/integrationFetcher';
import { deduplicateDeals, type UnifiedDeal } from '@/services/dataUnifier';
import { TrendingUp, DollarSign, Target, CheckCircle2, XCircle, Loader2, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Pipeline() {
  const { user, profile } = useAuth();
  const [deals, setDeals] = useState<UnifiedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user && profile) {
      loadDeals();
    }
  }, [user, profile]);

  const loadDeals = async () => {
    if (!user || !profile) return;
    
    setLoading(true);
    try {
      // Fetch from ALL connected sources
      const sources = await fetchAllDeals(user.id, profile.role);
      
      if (sources.length > 0) {
        // Merge and deduplicate
        const unified = deduplicateDeals(sources);
        setDeals(unified);
        setConnected(true);
      } else {
        setConnected(false);
        setDeals([]);
      }
    } catch (error) {
      console.error('Failed to load deals:', error);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = deals.filter(d => d.stage === 'won' || d.stage === 'closed_won');
  const lostDeals = deals.filter(d => d.stage === 'lost' || d.stage === 'closed_lost');

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <TrendingUp className="text-primary" size={32} />
                Pipeline
              </h1>
              <p className="text-muted-foreground mt-1">
                {connected 
                  ? 'Track deals and opportunities from all connected sources'
                  : 'Manage your sales pipeline'}
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <Plus size={18} />
              Add Deal
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : !connected ? (
          /* Empty State - Not Connected */
          <div className="flex flex-col items-center justify-center h-96">
            <GlassCard className="max-w-md text-center p-8">
              <TrendingUp className="mx-auto text-muted-foreground mb-4" size={48} />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Deals Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Add deals manually or connect your CRM to sync automatically.
              </p>
              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  <Plus size={18} />
                  Add Deal Manually
                </button>
                <button 
                  onClick={() => window.location.href = '/integrations'}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-transparent text-primary border border-primary/30 rounded-lg font-medium hover:bg-primary/10 transition-colors"
                >
                  Connect Your CRM →
                </button>
              </div>
            </GlassCard>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      ${totalValue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="text-green-500" size={24} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Deals</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {deals.length}
                    </p>
                  </div>
                  <Target className="text-blue-500" size={24} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Won</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {wonDeals.length}
                    </p>
                  </div>
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Lost</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {lostDeals.length}
                    </p>
                  </div>
                  <XCircle className="text-red-500" size={24} />
                </div>
              </GlassCard>
            </div>

            {/* Deals List */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Active Deals
                <span className="text-sm text-muted-foreground ml-2">
                  {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
                </span>
              </h3>

              <div className="space-y-3">
                {deals.map((deal) => (
                  <GlassCard key={deal.id} className="p-4 hover:bg-background/80 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-foreground">
                          {deal.title}
                        </h4>
                        
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            ${deal.value.toLocaleString()}
                          </div>
                          {deal.contactName && (
                            <div className="flex items-center gap-1">
                              {deal.contactName}
                            </div>
                          )}
                        </div>

                        {/* Source Badges */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {deal.sources.map((source, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs rounded-md bg-background/60 text-muted-foreground border border-border"
                            >
                              {source.icon} {source.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <span className="text-xs text-blue-500 font-medium px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                        {deal.stage}
                      </span>
                    </div>
                  </GlassCard>
                ))}

                {deals.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No active deals
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
