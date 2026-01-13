import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { USER_TIERS, UserTierId } from "@/contexts/UserTierContext";
import { useTierMetrics } from "@/hooks/useTierMetrics";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  MessageSquare,
  BarChart3,
  Repeat,
  ExternalLink,
  Link2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const TIER_ORDER: UserTierId[] = [
  "free",
  "ai_assistant",
  "ai_operations",
  "ai_enterprise",
  "ai_advisory",
  "ai_tax",
  "ai_compliance",
];

export function TierMetrics() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useTierMetrics();

  const handlePortalClick = (tierId: UserTierId) => {
    navigate(`/portal/${tierId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Loading metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-destructive/50 bg-destructive/10">
        <p className="text-destructive">Failed to load metrics: {error.message}</p>
      </div>
    );
  }

  const stats = data;

  return (
    <div className="space-y-6">
      {/* Platform Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Platform MRR</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            ${stats?.totalMrr?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.totalUsers?.toLocaleString() || 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Conversations</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.totalConversations?.toLocaleString() || 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Product Types</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{TIER_ORDER.length}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">User Type Portals</h3>
          <p className="text-sm text-muted-foreground">Real-time KPIs by product tier</p>
        </div>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {TIER_ORDER.map((tierId, index) => {
          const tier = USER_TIERS[tierId];
          const tierData = stats?.tierStats[tierId];

          return (
            <motion.div
              key={tierId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handlePortalClick(tierId)}
              className="relative overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
            >
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg",
                    tier.color
                  )}>
                    {tier.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      {tier.displayName}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">{tier.description}</p>
                  </div>
                </div>
              </div>

              {/* KPIs Grid */}
              <div className="p-3 grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                    <Users className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-wide">Users</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {tierData?.userCount || 0}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                    <Activity className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-wide">Active</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {tierData?.activeUsers || 0}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-wide">MRR</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    ${tierData?.mrr?.toFixed(0) || 0}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                    <MessageSquare className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-wide">Chats</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {tierData?.conversationCount || 0}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                    <Repeat className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-wide">Messages</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {tierData?.messageCount || 0}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                    <Link2 className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-wide">Integrations</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {tierData?.integrationCount || 0}
                  </p>
                </div>
              </div>

              {/* Gradient overlay */}
              <div className={cn(
                "absolute inset-0 opacity-5 bg-gradient-to-br pointer-events-none group-hover:opacity-10 transition-opacity",
                tier.color
              )} />
            </motion.div>
          );
        })}
      </div>

      {/* Platform Capabilities */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border">
        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Global Platform Capabilities (All Tiers)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Document Input
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            AI-Assisted Output
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            AI Vault
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            AI Communications
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            AI LMS Access
          </div>
        </div>
      </div>
    </div>
  );
}
