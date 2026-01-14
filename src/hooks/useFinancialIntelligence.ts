import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
}

export interface FinancialStatus {
  connected: boolean;
  providers?: string[];
  error?: string;
  message?: string;
}

export function useFinancialIntelligence() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<FinancialStatus | null>(null);
  const [data, setData] = useState<FinancialSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch financial data from all connected providers
  const fetchFinancialData = useCallback(async (): Promise<FinancialSummary[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: fetchData, error: fnError } = await supabase.functions.invoke('financial-fetch', {});
      
      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch financial data');
      }

      if (!fetchData.connected) {
        setStatus({ connected: false, message: fetchData.message, error: fetchData.error });
        return null;
      }

      if (fetchData.error) {
        setStatus({ connected: true, error: fetchData.error });
        return null;
      }

      const financialData = fetchData.data as FinancialSummary[];
      setData(financialData);
      setStatus({ 
        connected: true, 
        providers: financialData.map(d => d.provider),
      });
      
      return financialData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Financial data fetch failed';
      setError(errorMsg);
      setStatus({ connected: false, error: errorMsg });
      toast.error(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Format financial data for chat display
  const formatFinancialForChat = useCallback((financialData: FinancialSummary[]): string => {
    const lines: string[] = [];
    
    lines.push(`💰 **Financial Intelligence Report**`);
    lines.push(`Last sync: ${new Date().toLocaleTimeString()}`);
    lines.push('');

    // Aggregate metrics across all providers
    let totalReceivable = 0;
    let totalOverdue = 0;
    let totalBalance = 0;
    let totalIncome = 0;
    const allInvoices: (Invoice & { provider: string })[] = [];
    const allTransactions: (FinancialSummary['recentTransactions'][0] & { provider: string })[] = [];

    for (const summary of financialData) {
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
