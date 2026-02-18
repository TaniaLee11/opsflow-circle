import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllTransactionSources, type UnifiedTransaction } from '@/services/unifiedData';
import { Building, CreditCard, TrendingUp, TrendingDown, Plus, Loader2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  lastFour: string;
  institution: string;
  sources: { icon: string; label: string }[];
}

export default function Banking() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch from ALL connected bank sources (Plaid, Stripe, manual bank connections)
      const sources = await fetchAllTransactionSources(user.id);
      
      if (sources.length === 0) {
        setIsConnected(false);
        setAccounts([]);
        setTransactions([]);
      } else {
        // Group transactions by account/source
        const accountMap = new Map<string, BankAccount>();
        
        sources.forEach((source) => {
          source.transactions.forEach((txn: any) => {
            const accountId = txn.accountId || source.provider;
            
            if (!accountMap.has(accountId)) {
              accountMap.set(accountId, {
                id: accountId,
                name: txn.accountName || `${source.provider} Account`,
                type: txn.accountType || 'checking',
                balance: 0,
                lastFour: txn.accountLastFour || '****',
                institution: source.provider,
                sources: [{ icon: '🏦', label: source.provider }],
              });
            }
            
            // Update balance
            const account = accountMap.get(accountId)!;
            account.balance += txn.amount;
          });
        });
        
        const accountsList = Array.from(accountMap.values());
        setAccounts(accountsList);
        setIsConnected(true);

        // Set first account as selected
        if (accountsList.length > 0 && !selectedAccount) {
          setSelectedAccount(accountsList[0].id);
        }

        // Get transactions for selected account
        if (selectedAccount) {
          const accountTransactions = sources
            .flatMap(s => s.transactions)
            .filter((t: any) => (t.accountId || s.provider) === selectedAccount);
          setTransactions(accountTransactions);
        }
      }
    } catch (error) {
      console.error('Failed to load banking data:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      loadData();
    }
  }, [selectedAccount]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Building className="text-indigo-500" size={32} />
                Banking
              </h1>
              <p className="text-muted-foreground mt-1">
                {isConnected 
                  ? 'All your bank accounts in one place' 
                  : 'Connect your bank accounts to see balances and transactions'}
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              <Plus size={18} />
              Add Account
            </button>
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
              No Bank Accounts Connected
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your bank accounts via Plaid, Stripe, or manually to see all your accounts and transactions in one place.
            </p>
            <button 
              onClick={() => window.location.href = '/integrations'}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Connect Your Bank
            </button>
          </GlassCard>
        ) : (
          <>
            {/* Total Balance */}
            <GlassCard className="p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                  <p className="text-4xl font-bold text-foreground">
                    ${totalBalance.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Across {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
                  </p>
                </div>
                <Building className="text-indigo-500" size={48} />
              </div>
            </GlassCard>

            {/* Accounts List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {accounts.map((account) => (
                <GlassCard
                  key={account.id}
                  className={cn(
                    "p-6 cursor-pointer transition-all",
                    selectedAccount === account.id
                      ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
                      : "hover:border-indigo-500/50"
                  )}
                  onClick={() => setSelectedAccount(account.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-indigo-500" size={20} />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {account.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          ****{account.lastFour}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full capitalize",
                      account.type === 'checking' && "bg-blue-500/10 text-blue-500",
                      account.type === 'savings' && "bg-green-500/10 text-green-500",
                      account.type === 'credit' && "bg-orange-500/10 text-orange-500"
                    )}>
                      {account.type}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground mb-1">Balance</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      account.balance >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      ${Math.abs(account.balance).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {account.sources.map((source, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        {source.icon} {source.label}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Recent Transactions for Selected Account */}
            {selectedAccount && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Recent Transactions
                </h3>
                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No transactions found for this account.
                    </p>
                  ) : (
                    transactions.slice(0, 10).map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          {txn.amount >= 0 ? (
                            <TrendingUp className="text-green-500" size={18} />
                          ) : (
                            <TrendingDown className="text-red-500" size={18} />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {txn.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(txn.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <p className={cn(
                          "text-sm font-bold",
                          txn.amount >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {txn.amount >= 0 ? '+' : '-'}${Math.abs(txn.amount).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            )}
          </>
        )}
      </main>
    </div>
  );
}
