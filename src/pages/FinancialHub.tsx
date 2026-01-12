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
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  status: "good" | "warning" | "critical";
  explanation: string;
}

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
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Financial Hub</h1>
                <p className="text-muted-foreground">Your money, explained simply</p>
              </div>
            </div>
            
            <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Sync Accounts
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
      </main>
    </div>
  );
}
