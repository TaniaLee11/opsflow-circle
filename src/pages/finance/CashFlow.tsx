import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllTransactionSources, deduplicateTransactions, type UnifiedTransaction } from '@/services/unifiedData';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Loader2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CashFlow() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isConnected, setIsConnected] = useState(false);
  const [cashFlowData, setCashFlowData] = useState({
    openingBalance: 0,
    totalInflows: 0,
    totalOutflows: 0,
    closingBalance: 0,
    netChange: 0,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedPeriod]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const sources = await fetchAllTransactionSources(user.id);
      
      if (sources.length === 0) {
        setIsConnected(false);
        setTransactions([]);
      } else {
        const unified = deduplicateTransactions(sources);
        
        // Filter by selected period
        const now = new Date();
        const periodStart = new Date();
        
        switch (selectedPeriod) {
          case 'week':
            periodStart.setDate(now.getDate() - 7);
            break;
          case 'month':
            periodStart.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            periodStart.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            periodStart.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        const periodTransactions = unified.filter(t => new Date(t.date) >= periodStart);
        setTransactions(periodTransactions);
        setIsConnected(true);

        // Calculate cash flow
        const inflows = periodTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const outflows = periodTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const netChange = inflows - outflows;
        
        // Opening balance would come from previous period (simplified here)
        const openingBalance = 50000; // TODO: Calculate from previous period
        const closingBalance = openingBalance + netChange;

        setCashFlowData({
          openingBalance,
          totalInflows: inflows,
          totalOutflows: outflows,
          closingBalance,
          netChange,
        });
      }
    } catch (error) {
      console.error('Failed to load cash flow data:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <TrendingUp className="text-blue-500" size={32} />
                Cash Flow
              </h1>
              <p className="text-muted-foreground mt-1">
                {isConnected 
                  ? 'Track money in and out of your business' 
                  : 'Connect your accounting software to see cash flow'}
              </p>
            </div>
            
            {/* Period Selector */}
            <div className="flex gap-2">
              {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors capitalize",
                    selectedPeriod === period
                      ? "bg-blue-600 text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : !isConnected ? (
          /* Empty State */
          <GlassCard className="p-12 text-center">
            <LinkIcon className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Accounting Software Connected
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your accounting software, payment processors, or banking integrations to automatically track cash flow.
            </p>
            <button 
              onClick={() => window.location.href = '/integrations'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Connect Your Tools
            </button>
          </GlassCard>
        ) : (
          <>
            {/* Cash Flow Summary */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Opening Balance</p>
                    <p className="text-xl font-bold text-foreground mt-1">
                      ${cashFlowData.openingBalance.toLocaleString()}
                    </p>
                  </div>
                  <Calendar className="text-muted-foreground" size={20} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Inflows</p>
                    <p className="text-xl font-bold text-green-500 mt-1">
                      +${cashFlowData.totalInflows.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="text-green-500" size={20} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Outflows</p>
                    <p className="text-xl font-bold text-red-500 mt-1">
                      -${cashFlowData.totalOutflows.toLocaleString()}
                    </p>
                  </div>
                  <TrendingDown className="text-red-500" size={20} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Change</p>
                    <p className={cn(
                      "text-xl font-bold mt-1",
                      cashFlowData.netChange >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {cashFlowData.netChange >= 0 ? '+' : ''}${cashFlowData.netChange.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className={cashFlowData.netChange >= 0 ? "text-green-500" : "text-red-500"} size={20} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Closing Balance</p>
                    <p className="text-xl font-bold text-blue-500 mt-1">
                      ${cashFlowData.closingBalance.toLocaleString()}
                    </p>
                  </div>
                  <Calendar className="text-blue-500" size={20} />
                </div>
              </GlassCard>
            </div>

            {/* Transactions Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inflows */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-500" size={20} />
                  Inflows
                </h3>
                <div className="space-y-3">
                  {transactions
                    .filter(t => t.amount > 0)
                    .slice(0, 5)
                    .map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{txn.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(txn.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-green-500">
                          +${txn.amount.toLocaleString()}
                        </p>
                      </div>
                    ))}
                </div>
              </GlassCard>

              {/* Outflows */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingDown className="text-red-500" size={20} />
                  Outflows
                </h3>
                <div className="space-y-3">
                  {transactions
                    .filter(t => t.amount < 0)
                    .slice(0, 5)
                    .map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{txn.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(txn.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-red-500">
                          -${Math.abs(txn.amount).toLocaleString()}
                        </p>
                      </div>
                    ))}
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
