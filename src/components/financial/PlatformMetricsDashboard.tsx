import { motion } from "framer-motion";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  UserPlus,
  UserMinus,
  Target,
  Zap,
  Award,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlatformMetrics {
  mrr: number;
  mrrGrowth: number;
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  churnedUsersThisMonth: number;
  churnRate: number;
  tierDistribution: {
    AI_FREE: number;
    AI_ASSISTANT: number;
    AI_OPERATIONS: number;
  };
  revenueByTier: {
    AI_ASSISTANT: number;
    AI_OPERATIONS: number;
  };
  avgRevenuePerUser: number;
  lifetimeValue: number;
  topClients: Array<{
    name: string;
    tier: string;
    mrr: number;
  }>;
}

interface PlatformMetricsDashboardProps {
  metrics: PlatformMetrics;
}

export function PlatformMetricsDashboard({ metrics }: PlatformMetricsDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Platform Metrics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Virtual OPS Hub SaaS Business Performance
          </p>
        </div>
        <Badge variant="outline" className="text-primary border-primary">
          Platform Owner View
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-success" />
                Monthly Recurring Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(metrics.mrr)}
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm mt-2",
                metrics.mrrGrowth >= 0 ? "text-success" : "text-destructive"
              )}>
                {metrics.mrrGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{formatPercent(metrics.mrrGrowth)} vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="glass gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {metrics.activeUsers}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                of {metrics.totalUsers} total users
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* New Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-success" />
                New This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                +{metrics.newUsersThisMonth}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                New signups
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Churn Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="glass gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-warning" />
                Churn Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-3xl font-bold",
                metrics.churnRate < 5 ? "text-success" : metrics.churnRate < 10 ? "text-warning" : "text-destructive"
              )}>
                {metrics.churnRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {metrics.churnedUsersThisMonth} churned this month
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tier Distribution & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass gradient-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                User Distribution by Tier
              </CardTitle>
              <CardDescription>Active users across subscription tiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <span className="text-sm font-medium">AI Free</span>
                  </div>
                  <span className="text-lg font-bold">{metrics.tierDistribution.AI_FREE}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm font-medium">AI Assistant ($34.99)</span>
                  </div>
                  <span className="text-lg font-bold">{metrics.tierDistribution.AI_ASSISTANT}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-sm font-medium">AI Operations ($99.99)</span>
                  </div>
                  <span className="text-lg font-bold">{metrics.tierDistribution.AI_OPERATIONS}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue by Tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="glass gradient-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-success" />
                Revenue by Tier
              </CardTitle>
              <CardDescription>Monthly recurring revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">AI Assistant</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(metrics.revenueByTier.AI_ASSISTANT)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">AI Operations</span>
                  <span className="text-lg font-bold text-success">
                    {formatCurrency(metrics.revenueByTier.AI_OPERATIONS)}
                  </span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total MRR</span>
                    <span className="text-xl font-bold text-foreground">
                      {formatCurrency(metrics.mrr)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Revenue Per User</span>
                  <span className="font-medium">{formatCurrency(metrics.avgRevenuePerUser)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Clients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-warning" />
              Top Clients
            </CardTitle>
            <CardDescription>Highest revenue contributors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-surface-hover/30">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      index === 0 ? "bg-warning/20 text-warning" : 
                      index === 1 ? "bg-muted text-muted-foreground" :
                      "bg-primary/20 text-primary"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-xs text-muted-foreground">{client.tier}</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-success">
                    {formatCurrency(client.mrr)}/mo
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
