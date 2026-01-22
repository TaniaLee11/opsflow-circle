import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  number: string;
  customerName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'draft';
  dueDate: string;
  createdDate: string;
}

export interface CashFlowData {
  balance: number;
  income: number;
  expenses: number;
  currency: string;
  period: string;
}

export interface FinancialSummary {
  provider: string;
  connectedAccount: string;
  lastSync: string;
  cashFlow: CashFlowData | null;
  invoices: Invoice[];
  recentTransactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
  }>;
  metrics: {
    totalReceivable: number;
    totalPayable: number;
    overdueCount: number;
    upcomingPayments: number;
  };
  // Error state fields for handling re-auth requirements
  error?: string;
  errorMessage?: string;
}

export interface FinancialStatus {
  connected: boolean;
  providers?: string[];
  error?: string;
  message?: string;
  action?: string;
  oauthRequired?: boolean;
  reauthRequired?: boolean;
  reauthProviders?: string[];
}

export function useFinancialIntelligence() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<FinancialStatus | null>(null);
  const [data, setData] = useState<FinancialSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  // Fetch financial data from all connected providers
  const fetchFinancialData = useCallback(async (): Promise<FinancialSummary[] | null> => {
    if (!user?.id) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: fetchData, error: fnError } = await supabase.functions.invoke('financial-fetch', {});
      
      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch financial data');
      }

      // Handle OAUTH_REQUIRED - this is expected when no OAuth connections exist
      if (fetchData.error === 'OAUTH_REQUIRED' || !fetchData.connected) {
        setStatus({ 
          connected: false, 
          message: fetchData.message,
          action: fetchData.action,
          oauthRequired: true,
        });
        setLastFetchedAt(new Date());
        return null;
      }

      if (fetchData.error) {
        setStatus({ connected: true, error: fetchData.error });
        setLastFetchedAt(new Date());
        return null;
      }

      const financialData = fetchData.data as FinancialSummary[];
      setData(financialData);
      
      // Check if any providers need re-authentication
      const reauthProviders = financialData
        .filter(d => d.error === 'REAUTH_REQUIRED')
        .map(d => d.provider);
      
      if (reauthProviders.length > 0) {
        setStatus({ 
          connected: true, 
          providers: financialData.map(d => d.provider),
          reauthRequired: true,
          reauthProviders,
          message: `${reauthProviders.join(', ')} authorization expired. Please reconnect.`,
        });
        toast.warning(`${reauthProviders.join(', ')} needs to be reconnected`, {
          description: 'Authorization expired. Go to Integrations to reconnect.',
          action: {
            label: 'Reconnect',
            onClick: () => window.location.href = '/integrations',
          },
        });
      } else {
        setStatus({ 
          connected: true, 
          providers: financialData.map(d => d.provider),
        });
      }
      setLastFetchedAt(new Date());
      
      return financialData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Financial data fetch failed';
      setError(errorMsg);
      setStatus({ connected: false, error: errorMsg });
      setLastFetchedAt(new Date());
      toast.error(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Auto-fetch on login/mount
  useEffect(() => {
    if (user?.id) {
      fetchFinancialData();
    }
  }, [user?.id, fetchFinancialData]);

  // Format financial data for chat display
  const formatFinancialForChat = useCallback((financialData: FinancialSummary[]): string => {
    const lines: string[] = [];
    
    lines.push(`💰 **Financial Intelligence Report**`);
    lines.push(`Last sync: ${new Date().toLocaleTimeString()}`);
    lines.push('');

    // Check for any providers needing re-authentication
    const reauthProviders = financialData.filter(s => s.error === 'REAUTH_REQUIRED');
    if (reauthProviders.length > 0) {
      lines.push('---');
      lines.push('⚠️ **Action Required**');
      for (const provider of reauthProviders) {
        lines.push(`• **${provider.provider}**: ${provider.errorMessage || 'Authorization expired. Please reconnect on the Integrations page.'}`);
      }
      lines.push('');
    }

    // Aggregate metrics across all providers (excluding error states)
    const validData = financialData.filter(s => !s.error);
    let totalReceivable = 0;
    let totalOverdue = 0;
    let totalBalance = 0;
    let totalIncome = 0;
    const allInvoices: (Invoice & { provider: string })[] = [];
    const allTransactions: (FinancialSummary['recentTransactions'][0] & { provider: string })[] = [];

    for (const summary of validData) {
      lines.push(`---`);
      lines.push(`📊 **${summary.provider}** (${summary.connectedAccount})`);
      
      if (summary.cashFlow) {
        const cf = summary.cashFlow;
        lines.push(`• Balance: **${formatCurrency(cf.balance, cf.currency)}**`);
        if (cf.income > 0) {
          lines.push(`• Income (${cf.period}): ${formatCurrency(cf.income, cf.currency)}`);
        }
        totalBalance += cf.balance;
        totalIncome += cf.income;
      }

      if (summary.metrics) {
        if (summary.metrics.totalReceivable > 0) {
          lines.push(`• Accounts Receivable: ${formatCurrency(summary.metrics.totalReceivable, 'USD')}`);
          totalReceivable += summary.metrics.totalReceivable;
        }
        if (summary.metrics.overdueCount > 0) {
          lines.push(`• ⚠️ Overdue Invoices: **${summary.metrics.overdueCount}**`);
          totalOverdue += summary.metrics.overdueCount;
        }
      }

      // Collect all invoices and transactions
      for (const inv of summary.invoices) {
        allInvoices.push({ ...inv, provider: summary.provider });
      }
      for (const txn of summary.recentTransactions) {
        allTransactions.push({ ...txn, provider: summary.provider });
      }

      lines.push('');
    }

    // Summary section
    lines.push('---');
    lines.push('📈 **Summary Across All Accounts**');
    if (totalBalance > 0) {
      lines.push(`• Total Available Balance: **${formatCurrency(totalBalance, 'USD')}**`);
    }
    if (totalReceivable > 0) {
      lines.push(`• Total Receivables: ${formatCurrency(totalReceivable, 'USD')}`);
    }
    if (totalOverdue > 0) {
      lines.push(`• ⚠️ Total Overdue: **${totalOverdue} invoice(s)**`);
    }
    lines.push('');

    // Overdue invoices details
    const overdueInvoices = allInvoices.filter(i => i.status === 'overdue');
    if (overdueInvoices.length > 0) {
      lines.push('---');
      lines.push('🔴 **Overdue Invoices — Action Required**');
      overdueInvoices.slice(0, 5).forEach((inv, i) => {
        const daysOverdue = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        lines.push(`**${i + 1}.** ${inv.customerName} — ${formatCurrency(inv.amount, inv.currency)} (${daysOverdue} days overdue)`);
      });
      if (overdueInvoices.length > 5) {
        lines.push(`   ...and ${overdueInvoices.length - 5} more overdue`);
      }
      lines.push('');
    }

    // Unpaid invoices
    const unpaidInvoices = allInvoices.filter(i => i.status === 'unpaid');
    if (unpaidInvoices.length > 0) {
      lines.push('---');
      lines.push('🟡 **Pending Invoices**');
      unpaidInvoices.slice(0, 5).forEach((inv, i) => {
        const dueDate = new Date(inv.dueDate).toLocaleDateString();
        lines.push(`**${i + 1}.** ${inv.customerName} — ${formatCurrency(inv.amount, inv.currency)} (due ${dueDate})`);
      });
      if (unpaidInvoices.length > 5) {
        lines.push(`   ...and ${unpaidInvoices.length - 5} more pending`);
      }
      lines.push('');
    }

    // Recent transactions
    if (allTransactions.length > 0) {
      lines.push('---');
      lines.push('📋 **Recent Transactions**');
      allTransactions.slice(0, 5).forEach((txn) => {
        const icon = txn.type === 'income' ? '💵' : '💸';
        const date = new Date(txn.date).toLocaleDateString();
        lines.push(`${icon} ${date}: ${txn.description} — ${formatCurrency(txn.amount, 'USD')}`);
      });
      lines.push('');
    }

    lines.push('---');
    lines.push('💬 **What would you like to know?**');
    lines.push('• "Which invoices are overdue?"');
    lines.push('• "What\'s my current cash position?"');
    lines.push('• "Show me recent payments"');

    return lines.join('\n');
  }, []);

  return {
    isLoading,
    status,
    data,
    error,
    lastFetchedAt,
    fetchFinancialData,
    formatFinancialForChat,
  };
}

// Helper function to format currency
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
}
