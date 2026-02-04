import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Sparkles,
  ChevronRight,
  RefreshCw,
  FileText,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Upload,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFinancialIntelligence, FinancialSummary, Invoice } from "@/hooks/useFinancialIntelligence";
import { useFinancialDocuments } from "@/hooks/useFinancialDocuments";
import { DocumentUploadDialog } from "@/components/financial/DocumentUploadDialog";
import { UploadedDocumentsList } from "@/components/financial/UploadedDocumentsList";
import { FinancialExportButton } from "@/components/financial/FinancialExportButton";


interface FinancialMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  status: "good" | "warning" | "critical";
  explanation: string;
}

export default function FinancialHub() {
  const { isAuthenticated, isOwner } = useAuth();
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Real data from integrations (auto-fetches on login)
  const { 
    isLoading: isLoadingIntegrations, 
    data: financialData, 
    fetchFinancialData,
    lastFetchedAt,
    status: integrationStatus
  } = useFinancialIntelligence();

  // Document uploads
  const { 
    documents, 
    isUploading, 
    fetchDocuments, 
    uploadDocument 
  } = useFinancialDocuments();

  // Only fetch documents on mount (financial data auto-fetches via hook)
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Compute metrics from real data
  const metrics = useMemo((): FinancialMetric[] => {
    if (!financialData || financialData.length === 0) {
      return [
        {
          label: "Cash on Hand",
          value: "--",
          change: 0,
          changeLabel: "Connect integrations",
          status: "warning",
          explanation: "Connect QuickBooks, Stripe, or Xero to see your real cash position."
        },
        {
          label: "Monthly Revenue",
          value: "--",
          change: 0,
          changeLabel: "Connect integrations",
          status: "warning",
          explanation: "Connect your payment processor to track revenue."
        },
        {
          label: "Accounts Receivable",
          value: "--",
          change: 0,
          changeLabel: "Connect integrations",
          status: "warning",
          explanation: "Connect your accounting software to track outstanding invoices."
        },
        {
          label: "Documents Uploaded",
          value: documents.length.toString(),
          change: 0,
          changeLabel: "financial documents",
          status: documents.length > 0 ? "good" : "warning",
          explanation: "Upload bank statements and receipts for AI analysis."
        }
      ];
    }

    // Aggregate from all providers
    let totalBalance = 0;
    let totalIncome = 0;
    let totalReceivable = 0;
    let totalOverdue = 0;

    for (const summary of financialData) {
      if (summary.cashFlow) {
        totalBalance += summary.cashFlow.balance;
        totalIncome += summary.cashFlow.income;
      }
      if (summary.metrics) {
        totalReceivable += summary.metrics.totalReceivable;
        totalOverdue += summary.metrics.overdueCount;
      }
    }

    return [
      {
        label: "Cash on Hand",
        value: formatCurrency(totalBalance),
        change: 0,
        changeLabel: "across all accounts",
        status: totalBalance > 10000 ? "good" : totalBalance > 0 ? "warning" : "critical",
        explanation: `Total balance across ${financialData.length} connected account(s).`
      },
      {
        label: "Monthly Revenue",
        value: formatCurrency(totalIncome),
        change: 0,
        changeLabel: "this period",
        status: totalIncome > 0 ? "good" : "warning",
        explanation: "Income from connected payment processors and invoicing."
      },
      {
        label: "Accounts Receivable",
        value: formatCurrency(totalReceivable),
        change: 0,
        changeLabel: `${totalOverdue} overdue`,
        status: totalOverdue > 0 ? "warning" : "good",
        explanation: totalOverdue > 0 
          ? `You have ${totalOverdue} overdue invoice(s). Consider following up.`
          : "All outstanding invoices are current."
      },
      {
        label: "Documents Uploaded",
        value: documents.length.toString(),
        change: 0,
        changeLabel: "financial documents",
        status: documents.length > 0 ? "good" : "warning",
        explanation: "Upload bank statements and receipts for AI analysis."
      }
    ];
  }, [financialData, documents.length]);

  // Extract transactions from integration data
  const transactions = useMemo(() => {
    if (!financialData) return [];
    
    const allTxns: { id: string; description: string; amount: number; type: 'income' | 'expense'; date: string }[] = [];
    
    for (const summary of financialData) {
      for (const txn of summary.recentTransactions) {
        allTxns.push({
          id: txn.id,
          description: txn.description,
          amount: txn.amount,
          type: txn.type,
          date: new Date(txn.date).toLocaleDateString()
        });
      }
    }
    
    return allTxns.slice(0, 5);
  }, [financialData]);

  // Extract invoices from integration data
  const allInvoices = useMemo(() => {
    if (!financialData) return [];
    
    const invoices: (Invoice & { provider: string })[] = [];
    for (const summary of financialData) {
      for (const inv of summary.invoices) {
        invoices.push({ ...inv, provider: summary.provider });
      }
    }
    return invoices;
  }, [financialData]);

  const filteredInvoices = allInvoices.filter((inv) => {
    const matchesSearch = 
      inv.customerName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.number.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesFilter = !invoiceFilter || inv.status === invoiceFilter;
    return matchesSearch && matchesFilter;
  });

  const invoiceStats = {
    total: allInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: allInvoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0),
    outstanding: allInvoices.filter((i) => i.status === "unpaid" || i.status === "overdue").reduce((sum, i) => sum + i.amount, 0),
    overdue: allInvoices.filter((i) => i.status === "overdue").length,
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success/20 text-success border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Paid</Badge>;
      case "unpaid":
        return <Badge className="bg-info/20 text-info border-0"><Clock className="w-3 h-3 mr-1" />Unpaid</Badge>;
      case "overdue":
        return <Badge className="bg-destructive/20 text-destructive border-0"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case "draft":
        return <Badge className="bg-muted text-muted-foreground border-0"><FileText className="w-3 h-3 mr-1" />Draft</Badge>;
    }
  };

  // Export data for reports
  const transactionExportData = {
    title: 'Financial Transactions Report',
    headers: ['Date', 'Description', 'Type', 'Amount'],
    rows: transactions.map(tx => [tx.date, tx.description, tx.type, `$${Math.abs(tx.amount).toFixed(2)}`]),
    generatedAt: new Date().toLocaleString()
  };

  const invoiceExportData = {
    title: 'Client Invoices Report',
    headers: ['Invoice #', 'Customer', 'Amount', 'Status', 'Due Date'],
    rows: allInvoices.map(inv => [inv.number, inv.customerName, `$${inv.amount.toFixed(2)}`, inv.status, inv.dueDate]),
    generatedAt: new Date().toLocaleString()
  };

  // AI Insights based on real data
  const insights = useMemo(() => {
    const result: { type: 'alert' | 'tip'; title: string; description: string; action: string }[] = [];
    
    if (invoiceStats.overdue > 0) {
      result.push({
        type: 'alert',
        title: `${invoiceStats.overdue} Overdue Invoice(s)`,
        description: `You have $${invoiceStats.outstanding.toFixed(2)} in outstanding invoices. Consider sending reminders.`,
        action: 'View Invoices'
      });
    }
    
    if (!financialData || financialData.length === 0) {
      result.push({
        type: 'tip',
        title: 'Connect Your Accounts',
        description: 'Link QuickBooks, Stripe, or Xero to get real-time financial insights.',
        action: 'Go to Integrations'
      });
    }
    
    if (documents.length === 0) {
      result.push({
        type: 'tip',
        title: 'Upload Financial Documents',
        description: 'Upload bank statements or receipts for AI-powered analysis and categorization.',
        action: 'Upload Now'
      });
    }
    
    return result;
  }, [financialData, invoiceStats, documents.length]);

  const handleSync = () => {
    fetchFinancialData();
    fetchDocuments();
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        {/* Header */}
        <header className="sticky top-0 lg:top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Financial Hub</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {lastFetchedAt 
                    ? `Last synced: ${lastFetchedAt.toLocaleTimeString()}`
                    : 'Your money, explained simply'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setUploadDialogOpen(true)}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Doc
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleSync}
                disabled={isLoadingIntegrations}
                className="gap-2"
              >
                {isLoadingIntegrations ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Sync
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="invoices" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Client Invoices</span>
                <span className="sm:hidden">Invoices</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 sm:space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="group glass gradient-border rounded-xl p-6 hover:glow-primary-sm transition-all cursor-pointer relative"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        metric.status === "good" && "bg-success",
                        metric.status === "warning" && "bg-warning",
                        metric.status === "critical" && "bg-destructive"
                      )} />
                    </div>
                    
                    <p className="text-3xl font-bold text-foreground mb-2">{metric.value}</p>
                    
                    <div className="flex items-center gap-1.5">
                      {metric.change > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      ) : metric.change < 0 ? (
                        <ArrowDownRight className="w-4 h-4 text-success" />
                      ) : null}
                      {metric.change !== 0 && (
                        <span className={cn(
                          "text-sm font-medium",
                          metric.change > 0 && "text-success",
                          metric.change < 0 && "text-success"
                        )}>
                          {metric.change > 0 && "+"}{metric.change}%
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">{metric.changeLabel}</span>
                    </div>

                    {/* Explanation Tooltip */}
                    <div className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">{metric.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass gradient-border rounded-xl overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Recent Transactions</h3>
                        <p className="text-sm text-muted-foreground">
                          {transactions.length > 0 ? 'From connected integrations' : 'Connect accounts to see transactions'}
                        </p>
                      </div>
                      {transactions.length > 0 && (
                        <FinancialExportButton data={transactionExportData} filename="transactions" />
                      )}
                    </div>

                    <div className="divide-y divide-border">
                      {transactions.length > 0 ? (
                        transactions.map((tx, index) => (
                          <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="px-6 py-4 flex items-center gap-4 hover:bg-surface-hover/50 transition-colors"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                              tx.type === "income" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                            )}>
                              {tx.type === "income" ? (
                                <TrendingUp className="w-5 h-5" />
                              ) : (
                                <TrendingDown className="w-5 h-5" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{tx.description}</p>
                              <p className="text-sm text-muted-foreground">{tx.date}</p>
                            </div>

                            <span className={cn(
                              "font-semibold",
                              tx.type === "income" ? "text-success" : "text-foreground"
                            )}>
                              {tx.type === "income" ? "+" : "-"}${Math.abs(tx.amount).toLocaleString()}
                            </span>
                          </motion.div>
                        ))
                      ) : (
                        <div className="px-6 py-12 text-center text-muted-foreground">
                          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p>No transactions yet</p>
                          <p className="text-sm">Connect QuickBooks, Stripe, or Xero</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Uploaded Documents Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass gradient-border rounded-xl overflow-hidden mt-6"
                  >
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Uploaded Documents</h3>
                        <p className="text-sm text-muted-foreground">Bank statements, receipts, and invoices</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setUploadDialogOpen(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    <div className="p-4">
                      <UploadedDocumentsList onRefresh={fetchDocuments} />
                    </div>
                  </motion.div>
                </div>

                {/* AI Insights */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">AI Insights</h3>
                  </div>

                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + 0.1 * index }}
                      className={cn(
                        "glass rounded-xl p-5 border-l-4",
                        insight.type === "alert" ? "border-l-warning" : "border-l-info"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {insight.type === "alert" ? (
                          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                        ) : (
                          <Info className="w-5 h-5 text-info shrink-0" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                          <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
                            {insight.action}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass gradient-border rounded-xl p-5"
                  >
                    <h4 className="font-medium text-foreground mb-4">Quick Actions</h4>
                    <div className="space-y-2">
                      <button 
                        onClick={() => setUploadDialogOpen(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
                      >
                        <Upload className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">Upload Document</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">Connect Bank Account</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">Create Invoice</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="space-y-6">
              {/* Invoice Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatCurrency(invoiceStats.total)}</p>
                        <p className="text-xs text-muted-foreground">Total Invoiced</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-success/10">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatCurrency(invoiceStats.paid)}</p>
                        <p className="text-xs text-muted-foreground">Paid</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-info/10">
                        <Clock className="w-5 h-5 text-info" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatCurrency(invoiceStats.outstanding)}</p>
                        <p className="text-xs text-muted-foreground">Outstanding</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-destructive/10">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{invoiceStats.overdue}</p>
                        <p className="text-xs text-muted-foreground">Overdue</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Invoice List */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Client Invoices
                      </CardTitle>
                      <CardDescription>
                        {allInvoices.length > 0 
                          ? 'From connected integrations' 
                          : 'Connect QuickBooks, Stripe, or Xero to see invoices'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search invoices..."
                          value={invoiceSearch}
                          onChange={(e) => setInvoiceSearch(e.target.value)}
                          className="pl-9 w-48 sm:w-64"
                        />
                      </div>
                      <div className="flex gap-1">
                        {["all", "unpaid", "paid", "overdue"].map((status) => (
                          <Button
                            key={status}
                            variant={invoiceFilter === (status === "all" ? null : status) ? "default" : "outline"}
                            size="sm"
                            onClick={() => setInvoiceFilter(status === "all" ? null : status)}
                            className="capitalize"
                          >
                            {status}
                          </Button>
                        ))}
                      </div>
                      {allInvoices.length > 0 && (
                        <FinancialExportButton data={invoiceExportData} filename="invoices" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice, index) => (
                        <motion.div
                          key={invoice.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="p-2.5 rounded-lg bg-muted">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                            <div>
                              <p className="font-semibold text-foreground">{invoice.number}</p>
                              <p className="text-xs text-muted-foreground">{invoice.createdDate}</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground truncate">{invoice.customerName}</p>
                            </div>
                            <div className="text-center hidden sm:block">
                              {getStatusBadge(invoice.status)}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-foreground">{formatCurrency(invoice.amount, invoice.currency)}</p>
                              <p className="text-xs text-muted-foreground">Due: {invoice.dueDate}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    ) : allInvoices.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium">No invoices found</p>
                        <p className="text-sm">Connect QuickBooks, Stripe, or Xero to see your invoices</p>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No invoices match your search</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={uploadDocument}
        isUploading={isUploading}
      />
    </div>
  );
}

// Helper function to format currency
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
