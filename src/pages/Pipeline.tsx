import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from '@/components/ui/glass-card';
import { ghlService, type GHLPipeline, type GHLOpportunity } from '@/services/ghl';
import { TrendingUp, DollarSign, Target, CheckCircle2, XCircle, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pipeline() {
  const [pipelines, setPipelines] = useState<GHLPipeline[]>([]);
  const [opportunities, setOpportunities] = useState<GHLOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalDeals: 0,
    wonDeals: 0,
    lostDeals: 0,
    openDeals: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pipelinesData, opportunitiesData] = await Promise.all([
        ghlService.getPipelines(),
        ghlService.getOpportunities(),
      ]);
      
      setPipelines(pipelinesData);
      setOpportunities(opportunitiesData);
      
      if (pipelinesData.length > 0 && !selectedPipeline) {
        setSelectedPipeline(pipelinesData[0].id);
      }

      // Calculate stats
      const totalValue = opportunitiesData.reduce((sum, opp) => sum + (opp.monetaryValue || 0), 0);
      const wonDeals = opportunitiesData.filter(opp => opp.status === 'won').length;
      const lostDeals = opportunitiesData.filter(opp => opp.status === 'lost').length;
      const openDeals = opportunitiesData.filter(opp => opp.status === 'open').length;

      setStats({
        totalValue,
        totalDeals: opportunitiesData.length,
        wonDeals,
        lostDeals,
        openDeals,
      });
    } catch (error) {
      console.error('Failed to load pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = selectedPipeline
    ? opportunities.filter(opp => opp.pipelineId === selectedPipeline)
    : opportunities;

  const currentPipeline = pipelines.find(p => p.id === selectedPipeline);

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
                Track deals and opportunities from GoHighLevel
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
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                  <Target className="text-blue-500" size={24} />
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

            {/* Pipeline Selector */}
            {pipelines.length > 0 && (
              <div className="mb-6">
                <div className="flex gap-2 flex-wrap">
                  {pipelines.map(pipeline => (
                    <button
                      key={pipeline.id}
                      onClick={() => setSelectedPipeline(pipeline.id)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all",
                        selectedPipeline === pipeline.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-card/50 text-muted-foreground hover:bg-card"
                      )}
                    >
                      {pipeline.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pipeline Stages */}
            {currentPipeline && (
              <GlassCard>
                <GlassCardHeader>
                  <GlassCardTitle>{currentPipeline.name}</GlassCardTitle>
                  <GlassCardDescription>
                    {currentPipeline.stages.length} stages
                  </GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentPipeline.stages
                      .sort((a, b) => a.position - b.position)
                      .map(stage => {
                        const stageOpps = filteredOpportunities.filter(
                          opp => opp.pipelineStageId === stage.id
                        );
                        const stageValue = stageOpps.reduce(
                          (sum, opp) => sum + (opp.monetaryValue || 0),
                          0
                        );

                        return (
                          <div
                            key={stage.id}
                            className="glass rounded-lg p-4 border border-border/50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-foreground">
                                {stage.name}
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                {stageOpps.length}
                              </span>
                            </div>
                            <p className="text-lg font-bold text-primary">
                              ${stageValue.toLocaleString()}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Opportunities List */}
            {filteredOpportunities.length > 0 && (
              <GlassCard className="mt-6">
                <GlassCardHeader>
                  <GlassCardTitle>Opportunities</GlassCardTitle>
                  <GlassCardDescription>
                    {filteredOpportunities.length} active opportunities
                  </GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-3">
                    {filteredOpportunities.map(opp => (
                      <div
                        key={opp.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-card/30 border border-border/30 hover:bg-card/50 transition-colors"
                      >
                        <div>
                          <h5 className="font-medium text-foreground">{opp.name}</h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            Status: {opp.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            ${(opp.monetaryValue || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Empty State */}
            {pipelines.length === 0 && (
              <GlassCard className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Pipelines Found
                </h3>
                <p className="text-muted-foreground">
                  Connect your GoHighLevel account to see your pipelines and opportunities.
                </p>
              </GlassCard>
            )}
          </>
        )}
      </main>
    </div>
  );
}
