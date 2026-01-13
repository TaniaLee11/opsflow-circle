import { motion } from "framer-motion";
import { useUserTier, USER_TIERS, UserTierId } from "@/contexts/UserTierContext";
import { Users, Zap, TrendingUp, Clock, DollarSign, ArrowUpRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierMetric {
  tierId: UserTierId;
  tierName: string;
  activeUsers: number;
  mrr: number; // Monthly Recurring Revenue
  churnRate: number;
  avgSessionTime: string;
  growthRate: number;
  conversionRate: number;
  totalActions: number;
  icon: string;
  color: string;
}

// Mock data - in production, this would come from database
const mockTierMetrics: TierMetric[] = [
  {
    tierId: "free",
    tierName: "AI Free",
    activeUsers: 1247,
    mrr: 0,
    churnRate: 8.2,
    avgSessionTime: "4m 32s",
    growthRate: 12.5,
    conversionRate: 4.8,
    totalActions: 8420,
    icon: USER_TIERS.free.icon,
    color: USER_TIERS.free.color
  },
  {
    tierId: "ai_assistant",
    tierName: "AI Assistant",
    activeUsers: 384,
    mrr: 13436,
    churnRate: 3.1,
    avgSessionTime: "12m 18s",
    growthRate: 8.3,
    conversionRate: 12.4,
    totalActions: 15680,
    icon: USER_TIERS.ai_assistant.icon,
    color: USER_TIERS.ai_assistant.color
  },
  {
    tierId: "ai_operations",
    tierName: "AI Operations",
    activeUsers: 156,
    mrr: 15599,
    churnRate: 2.4,
    avgSessionTime: "28m 45s",
    growthRate: 15.7,
    conversionRate: 18.2,
    totalActions: 42350,
    icon: USER_TIERS.ai_operations.icon,
    color: USER_TIERS.ai_operations.color
  },
  {
    tierId: "ai_enterprise",
    tierName: "AI Enterprise",
    activeUsers: 47,
    mrr: 23453,
    churnRate: 1.2,
    avgSessionTime: "1h 12m",
    growthRate: 22.4,
    conversionRate: 34.5,
    totalActions: 89720,
    icon: USER_TIERS.ai_enterprise.icon,
    color: USER_TIERS.ai_enterprise.color
  },
  {
    tierId: "ai_advisory",
    tierName: "AI Advisory",
    activeUsers: 89,
    mrr: 17799,
    churnRate: 2.8,
    avgSessionTime: "42m 15s",
    growthRate: 18.9,
    conversionRate: 21.3,
    totalActions: 32450,
    icon: USER_TIERS.ai_advisory.icon,
    color: USER_TIERS.ai_advisory.color
  },
  {
    tierId: "ai_tax",
    tierName: "AI Tax",
    activeUsers: 234,
    mrr: 35097,
    churnRate: 4.5,
    avgSessionTime: "18m 32s",
    growthRate: 28.6,
    conversionRate: 15.7,
    totalActions: 28900,
    icon: USER_TIERS.ai_tax.icon,
    color: USER_TIERS.ai_tax.color
  },
  {
    tierId: "ai_compliance",
    tierName: "AI Compliance",
    activeUsers: 112,
    mrr: 20159,
    churnRate: 2.1,
    avgSessionTime: "35m 48s",
    growthRate: 14.2,
    conversionRate: 19.8,
    totalActions: 45670,
    icon: USER_TIERS.ai_compliance.icon,
    color: USER_TIERS.ai_compliance.color
  }
];

// Calculate totals for summary
const totalMRR = mockTierMetrics.reduce((sum, m) => sum + m.mrr, 0);
const totalUsers = mockTierMetrics.reduce((sum, m) => sum + m.activeUsers, 0);
const avgChurn = mockTierMetrics.reduce((sum, m) => sum + m.churnRate, 0) / mockTierMetrics.length;

export function TierMetrics() {
  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Total MRR</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${totalMRR.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalUsers.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Avg Churn</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{avgChurn.toFixed(1)}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Product Types</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{mockTierMetrics.length}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">User Type Portals</h3>
          <p className="text-sm text-muted-foreground">SaaS KPIs by product type / purchasable tier</p>
        </div>
        <button className="text-xs text-primary hover:text-primary/80 font-medium">
          View Full Report →
        </button>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {mockTierMetrics.map((metric, index) => (
          <motion.div
            key={metric.tierId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-4 hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg",
                metric.color
              )}>
                {metric.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{metric.tierName}</h4>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">+{metric.growthRate}%</span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                  <Users className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wide">Users</span>
                </div>
                <p className="font-semibold text-foreground">
                  {metric.activeUsers.toLocaleString()}
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                  <DollarSign className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wide">MRR</span>
                </div>
                <p className="font-semibold text-foreground">
                  ${metric.mrr.toLocaleString()}
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                  <Activity className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wide">Churn</span>
                </div>
                <p className="font-semibold text-foreground">
                  {metric.churnRate}%
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wide">Conv.</span>
                </div>
                <p className="font-semibold text-foreground">
                  {metric.conversionRate}%
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wide">Session</span>
                </div>
                <p className="font-semibold text-foreground text-xs">
                  {metric.avgSessionTime}
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                  <Zap className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wide">Actions</span>
                </div>
                <p className="font-semibold text-foreground text-xs">
                  {metric.totalActions.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Gradient overlay */}
            <div className={cn(
              "absolute inset-0 opacity-5 bg-gradient-to-br pointer-events-none",
              metric.color
            )} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
