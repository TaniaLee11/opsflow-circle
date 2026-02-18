import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllOpportunitySources, type UnifiedOpportunity } from '@/services/unifiedData';
import { TrendingUp, DollarSign, Target, CheckCircle2, XCircle, Loader2, Plus, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pipeline() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<UnifiedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalDeals: 0,
    wonDeals: 0,
    lostDeals: 0,
    openDeals: 0,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch from ALL connected sources (GHL opportunities + Stripe pending payments)
      const opps = await fetchAllOpportunitySources(user.id, user.user_metadata?.role || 'user');
      
      if (opps.length === 0) {
        setIsConnected(false);
        setOpportunities([]);
      } else {
        setOpportunities(opps);
        setIsConnected(true);

        // Calculate stats
        const totalValue = opps.reduce((sum, opp) => sum + opp.value, 0);
        const wonDeals = opps.filter(opp => opp.status === 'won').length;
        const lostDeals = opps.filter(opp => opp.status === 'lost').length;
        const openDeals = opps.filter(opp => opp.status === 'open').length;

        setStats({
          totalValue,
          totalDeals: opps.length,
          wonDeals,
          lostDeals,
          openDeals,
        });
      }
    } catch (error) {
      console.error('Failed to load pipeline data:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = selectedStage === 'all'
    ? opportunities
    : opportunities.filter(opp => opp.stage === selectedStage);

  const stages = Array.from(new Set(opportunities.map(opp => opp.stage)));

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
                {isConnected 
                  ? 'Track deals and opportunities from all connected sources' 
                  : 'Connect your CRM to track deals'}
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
        ) : !isConnected ? (
          /* Empty State - No Integrations Connected */
          <GlassCard className="p-12 text-center">
            <LinkIcon className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No CRM Connected
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your CRM (like GoHighLevel) or payment processor (like Stripe) to track deals and opportunities.
            </p>
            <button 
              onClick={() => window.location.href = '/integrations'}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Connect Your Tools
            </button>
          </GlassCard>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      ${stats.totalValue.toLocaleString()}
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
                      {stats.totalDeals}
                    </p>
                  </div>
                  <Target className="text-primary" size={24} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stats.openDeals}
                    </p>
                  </div>
                  <TrendingUp className="text-blue-500" size={24} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Won</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stats.wonDeals}
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
                      {stats.lostDeals}
                    </p>
                  </div>
                  <XCircle className="text-red-500" size={24} />
                </div>
              </GlassCard>
            </div>

            {/* Stage Filter */}
            <GlassCard className="p-4 mb-6">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedStage('all')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    selectedStage === 'all'
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  All Stages
                </button>
                {stages.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setSelectedStage(stage)}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-colors",
                      selectedStage === stage
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Opportunities List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Opportunities
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'deal' : 'deals'}
                </p>
              </div>

              {filteredOpportunities.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="text-muted-foreground">No deals found in this stage.</p>
                </GlassCard>
              ) : (
                filteredOpportunities.map((opp) => (
                  <GlassCard key={opp.id} className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {opp.title}
                          </h3>
                          {/* Source Badges */}
                          <div className="flex gap-1">
                            {opp.sources.map((source, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                                title={source.label}
                              >
                                {source.icon} {source.label}
                              </span>
                            ))}
                          </div>
                          {/* Status Badge */}
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium",
                              opp.status === 'won' && "bg-green-500/10 text-green-500",
                              opp.status === 'lost' && "bg-red-500/10 text-red-500",
                              opp.status === 'open' && "bg-blue-500/10 text-blue-500"
                            )}
                          >
                            {opp.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              ${opp.value.toLocaleString()}
                            </span>
                            <span>Stage: {opp.stage}</span>
                            {opp.contactName && <span>Contact: {opp.contactName}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
