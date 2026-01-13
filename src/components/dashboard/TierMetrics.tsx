import { motion } from "framer-motion";
import { useUserTier } from "@/contexts/UserTierContext";
import { Users, Zap, TrendingUp, Clock, Gift, Sparkles, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierMetric {
  tierId: string;
  tierName: string;
  activeUsers: number;
  totalActions: number;
  avgSessionTime: string;
  growthRate: number;
  icon: React.ReactNode;
  color: string;
}

// Mock data - in production, this would come from database
const mockTierMetrics: TierMetric[] = [
  {
    tierId: "free",
    tierName: "AI Free",
    activeUsers: 1247,
    totalActions: 8420,
    avgSessionTime: "4m 32s",
    growthRate: 12.5,
    icon: <Gift className="w-5 h-5" />,
    color: "from-gray-500 to-gray-400"
  },
  {
    tierId: "ai_assistant",
    tierName: "AI Assistant",
    activeUsers: 384,
    totalActions: 15680,
    avgSessionTime: "12m 18s",
    growthRate: 8.3,
    icon: <Sparkles className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-400"
  },
  {
    tierId: "ai_operations",
    tierName: "AI Operations",
    activeUsers: 156,
    totalActions: 42350,
    avgSessionTime: "28m 45s",
    growthRate: 15.7,
    icon: <Zap className="w-5 h-5" />,
    color: "from-purple-500 to-pink-400"
  },
  {
    tierId: "ai_operations_full",
    tierName: "AI Operations (Full)",
    activeUsers: 47,
    totalActions: 89720,
    avgSessionTime: "1h 12m",
    growthRate: 22.4,
    icon: <Rocket className="w-5 h-5" />,
    color: "from-primary to-orange-400"
  }
];

export function TierMetrics() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">User Type Metrics</h3>
          <p className="text-sm text-muted-foreground">Real-time KPIs by subscription tier</p>
        </div>
        <button className="text-xs text-primary hover:text-primary/80 font-medium">
          View Full Report →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockTierMetrics.map((metric, index) => (
          <motion.div
            key={metric.tierId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-4"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white",
                metric.color
              )}>
                {metric.icon}
              </div>
              <div>
                <h4 className="font-medium text-foreground">{metric.tierName}</h4>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">+{metric.growthRate}%</span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Users className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wide">Users</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {metric.activeUsers.toLocaleString()}
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Zap className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wide">Actions</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {metric.totalActions.toLocaleString()}
                </p>
              </div>
              
              <div className="col-span-2">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wide">Avg Session</span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {metric.avgSessionTime}
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
