import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllTransactionSources, deduplicateTransactions, type UnifiedTransaction } from '@/services/unifiedData';
import { DollarSign, TrendingUp, TrendingDown, Search, Filter, Plus, Loader2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Reconciliation() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'uncategorized' | 'recent'>('all');
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    uncategorized: 0,
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
      // Fetch from ALL connected accounting sources (QuickBooks, Wave, Stripe, bank connections)
      const sources = await fetchAllTransactionSources(user.id);
      
      if (sources.length === 0) {
        setIsConnected(false);
        setTransactions([]);
      } else {
        const unified = deduplicateTransactions(sources);
        setTransactions(unified);
        setIsConnected(true);

        // Calculate stats
        const income = unified.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const expenses = unified.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const uncategorized = unified.filter(t => !t.category || t.category === 'Uncategorized').length;

        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          netCashFlow: income - expenses,
          uncategorized,
        });
      }
    } catch (error) {
      console.error('Failed to load transaction data:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = searchQuery === '' || 
      txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (txn.category && txn.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'uncategorized') {
      return matchesSearch && (!txn.category || txn.category === 'Uncategorized');
    } else if (activeTab === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return matchesSearch && new Date(txn.date) >= thirtyDaysAgo;
    }
    
    return matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <DollarSign className="text-green-500" size={32} />
                Reconciliation
              </h1>
              <p className="text-muted-foreground mt-1">
                {isConnected 
                  ? 'Unified transactions from all connected accounting sources' 
                  : 'Connect your accounting software to see transactions'}
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
              <Plus size={18} />
              Add Transaction
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : !isConnected ? (
          /* Empty State - No Accounting Connected */
          <GlassCard className="p-12 text-center">
            <LinkIcon className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Accounting Software Connected
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect QuickBooks, Wave, Xero, or your bank to automatically sync and reconcile transactions.
            </p>
            <button 
              onClick={() => window.location.href = '/integrations'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Connect Your Tools
            </button>
          </GlassCard>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Income</p>
                    <p className="text-2xl font-bold text-green-500 mt-1">
                      ${stats.totalIncome.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="text-green-500" size={24} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">
                      ${stats.totalExpenses.toLocaleString()}
                    </p>
                  </div>
                  <TrendingDown className="text-red-500" size={24} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                    <p className={cn(
                      "text-2xl font-bold mt-1",
                      stats.netCashFlow >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      ${stats.netCashFlow.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className={stats.netCashFlow >= 0 ? "text-green-500" : "text-red-500"} size={24} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Uncategorized</p>
                    <p className="text-2xl font-bold text-orange-500 mt-1">
                      {stats.uncategorized}
                    </p>
                  </div>
                  <Filter className="text-orange-500" size={24} />
                </div>
              </GlassCard>
            </div>

            {/* Search and Filters */}
            <GlassCard className="p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    activeTab === 'all'
                      ? "bg-green-600 text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('uncategorized')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    activeTab === 'uncategorized'
                      ? "bg-green-600 text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  Uncategorized ({stats.uncategorized})
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    activeTab === 'recent'
                      ? "bg-green-600 text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  Recent (30 days)
                </button>
              </div>
            </GlassCard>

            {/* Transactions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Transactions
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
                </p>
              </div>

              {filteredTransactions.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No transactions match your search.' : 'No transactions found.'}
                  </p>
                </GlassCard>
              ) : (
                filteredTransactions.map((txn) => (
                  <GlassCard key={txn.id} className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {txn.description}
                          </h3>
                          {/* Source Badges */}
                          <div className="flex gap-1">
                            {txn.sources.map((source, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                                title={source.label}
                              >
                                {source.icon} {source.label}
                              </span>
                            ))}
                          </div>
                          {/* Category Badge */}
                          {txn.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                              {txn.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(txn.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className={cn(
                        "text-xl font-bold",
                        txn.amount >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {txn.amount >= 0 ? '+' : '-'}${Math.abs(txn.amount).toLocaleString()}
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
