import { useState } from "react";
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
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface FinancialMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  status: "good" | "warning" | "critical";
  explanation: string;
}

// Mock invoices data for owner
interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  createdAt: string;
  description: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    clientName: "ABC Consulting",
    clientEmail: "billing@abcconsulting.com",
    amount: 499,
    status: "paid",
    dueDate: "2026-01-01",
    createdAt: "2025-12-15",
    description: "AI Enterprise - Monthly Subscription"
  },
  {
    id: "INV-002",
    clientName: "StartupXYZ",
    clientEmail: "finance@startupxyz.io",
    amount: 99.99,
    status: "sent",
    dueDate: "2026-01-20",
    createdAt: "2026-01-05",
    description: "AI Operations - Monthly Subscription"
  },
  {
    id: "INV-003",
    clientName: "Community Helpers Nonprofit",
    clientEmail: "admin@communityhelpers.org",
    amount: 125,
    status: "overdue",
    dueDate: "2026-01-05",
    createdAt: "2025-12-20",
    description: "AI Advisory - 1 Hour Session"
  },
  {
    id: "INV-004",
    clientName: "Freelance Pro LLC",
    clientEmail: "john@freelancepro.com",
    amount: 34.99,
    status: "paid",
    dueDate: "2026-01-10",
    createdAt: "2026-01-01",
    description: "AI Assistant - Monthly Subscription"
  },
  {
    id: "INV-005",
    clientName: "Tech Solutions Inc",
    clientEmail: "accounts@techsolutions.com",
    amount: 300,
    status: "draft",
    dueDate: "2026-02-01",
    createdAt: "2026-01-12",
    description: "1040 w/C Personal & Business Tax Prep"
  }
];

const metrics: FinancialMetric[] = [
  {
    label: "Cash on Hand",
    value: "$24,580",
    change: 12.5,
    changeLabel: "vs last month",
    status: "good",
    explanation: "You have about 3 months of runway at current spending. This is healthy for your stage."
  },
  {
    label: "Monthly Burn Rate",
    value: "$8,200",
    change: -5.2,
    changeLabel: "vs last month",
    status: "good",
    explanation: "Your expenses decreased this month. You're spending $273/day on average."
  },
  {
    label: "Revenue (MTD)",
    value: "$12,450",
    change: 8.3,
    changeLabel: "vs last month",
    status: "good",
    explanation: "You're on track to beat last month by about $1,000. Keep the momentum going."
  },
  {
    label: "Tax Set-Aside",
    value: "$3,735",
    change: 0,
    changeLabel: "30% of profit",
    status: "warning",
    explanation: "Based on your profit, you should have $4,200 set aside. You're $465 short."
  }
];

const transactions = [
  { id: 1, description: "Stripe Deposit", amount: 2450, type: "income", date: "Today" },
  { id: 2, description: "AWS Services", amount: -189, type: "expense", date: "Yesterday" },
  { id: 3, description: "Client Payment - ABC Corp", amount: 5000, type: "income", date: "Jan 10" },
  { id: 4, description: "Software Subscription", amount: -99, type: "expense", date: "Jan 9" },
  { id: 5, description: "Contractor Payment", amount: -1500, type: "expense", date: "Jan 8" },
];

const insights = [
  {
    type: "alert",
    title: "Quarterly Taxes Due",
    description: "Your Q4 estimated taxes are due January 15. Based on your income, you should pay approximately $3,200.",
    action: "Review Tax Estimate"
  },
  {
    type: "tip",
    title: "Expense Optimization",
    description: "You're paying for 3 similar software tools. Consolidating could save you $150/month.",
    action: "See Details"
  }
];

export default function FinancialHub() {
  const { isAuthenticated, isOwner } = useAuth();
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState<string | null>(null);

  const filteredInvoices = mockInvoices.filter((inv) => {
    const matchesSearch = 
      inv.clientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.id.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesFilter = !invoiceFilter || inv.status === invoiceFilter;
    return matchesSearch && matchesFilter;
  });

  const invoiceStats = {
    total: mockInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: mockInvoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0),
    outstanding: mockInvoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((sum, i) => sum + i.amount, 0),
    overdue: mockInvoices.filter((i) => i.status === "overdue").length,
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success/20 text-success border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Paid</Badge>;
      case "sent":
        return <Badge className="bg-info/20 text-info border-0"><Send className="w-3 h-3 mr-1" />Sent</Badge>;
      case "overdue":
        return <Badge className="bg-destructive/20 text-destructive border-0"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case "draft":
        return <Badge className="bg-muted text-muted-foreground border-0"><FileText className="w-3 h-3 mr-1" />Draft</Badge>;
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
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
                <p className="text-xs sm:text-sm text-muted-foreground">Your money, explained simply</p>
              </div>
            </div>
            
            <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-xs sm:text-sm font-medium flex items-center gap-2 w-fit">
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Sync Accounts
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Tabs - Show Invoices tab only for owners */}
          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Overview
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger value="invoices" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Client Invoices</span>
                  <span className="sm:hidden">Invoices</span>
                </TabsTrigger>
              )}
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
                      <span className={cn(
                        "text-sm font-medium",
                        metric.change > 0 && "text-success",
                        metric.change < 0 && "text-success"
                      )}>
                        {metric.change > 0 && "+"}{metric.change}%
                      </span>
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
                        <p className="text-sm text-muted-foreground">Your latest money movement</p>
                      </div>
                      <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                        View all
                      </button>
                    </div>

                    <div className="divide-y divide-border">
                      {transactions.map((tx, index) => (
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
                            {tx.type === "income" ? "+" : ""}{tx.amount < 0 ? "-" : ""}${Math.abs(tx.amount).toLocaleString()}
                          </span>
                        </motion.div>
                      ))}
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
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left">
                        <PiggyBank className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">Set Aside for Taxes</span>
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

            {/* Invoices Tab - Owner Only */}
            {isOwner && (
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
                          <p className="text-2xl font-bold">${invoiceStats.total.toFixed(2)}</p>
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
                          <p className="text-2xl font-bold">${invoiceStats.paid.toFixed(2)}</p>
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
                          <p className="text-2xl font-bold">${invoiceStats.outstanding.toFixed(2)}</p>
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
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Client Invoices
                        </CardTitle>
                        <CardDescription>Manage billing for your clients</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search invoices..."
                            value={invoiceSearch}
                            onChange={(e) => setInvoiceSearch(e.target.value)}
                            className="pl-9 w-64"
                          />
                        </div>
                        <div className="flex gap-1">
                          {["all", "draft", "sent", "paid", "overdue"].map((status) => (
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
                        <Button className="gap-2">
                          <Plus className="w-4 h-4" />
                          New Invoice
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredInvoices.map((invoice, index) => (
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
                          
                          <div className="flex-1 min-w-0 grid grid-cols-5 gap-4 items-center">
                            <div>
                              <p className="font-semibold text-foreground">{invoice.id}</p>
                              <p className="text-xs text-muted-foreground">{invoice.createdAt}</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground truncate">{invoice.clientName}</p>
                              <p className="text-xs text-muted-foreground truncate">{invoice.clientEmail}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground truncate">{invoice.description}</p>
                            </div>
                            <div className="text-center">
                              {getStatusBadge(invoice.status)}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-foreground">${invoice.amount.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">Due: {invoice.dueDate}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                      
                      {filteredInvoices.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p>No invoices found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
