import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { USER_TIERS, UserTierId } from "@/contexts/UserTierContext";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Activity,
  FileText,
  Calendar,
  Target,
  Clock,
  BarChart3,
  UserPlus,
  Repeat,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TierKPI {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
}

interface TierMetricData {
  tierId: UserTierId;
  tierName: string;
  tagline: string;
  icon: string;
  color: string;
  kpis: TierKPI[];
}

// Mock data matching the specified owner dashboard KPIs per tier
const tierMetrics: TierMetricData[] = [
  {
    tierId: "free",
    tierName: "AI Free",
    tagline: "Start organized. Move at your own pace.",
    icon: USER_TIERS.free.icon,
    color: USER_TIERS.free.color,
    kpis: [
      { label: "Active Users", value: "1,247", icon: <Users className="w-3 h-3" />, trend: { value: 12.5, positive: true } },
      { label: "Vault Adoption", value: "68%", icon: <FileText className="w-3 h-3" />, trend: { value: 4.2, positive: true } },
      { label: "Plan Starts", value: "892", icon: <Target className="w-3 h-3" /> },
      { label: "Plan Completions", value: "341", icon: <Activity className="w-3 h-3" /> },
      { label: "Free→Paid Conv.", value: "4.8%", icon: <ArrowUpRight className="w-3 h-3" />, trend: { value: 0.6, positive: true } },
      { label: "Docs/User", value: "8.3", icon: <FileText className="w-3 h-3" /> }
    ]
  },
  {
    tierId: "ai_assistant",
    tierName: "AI Assistant",
    tagline: "Guidance while you run the business.",
    icon: USER_TIERS.ai_assistant.icon,
    color: USER_TIERS.ai_assistant.color,
    kpis: [
      { label: "Active Users", value: "384", icon: <Users className="w-3 h-3" />, trend: { value: 8.3, positive: true } },
      { label: "Avg Interactions", value: "24.6/wk", icon: <Activity className="w-3 h-3" />, trend: { value: 3.1, positive: true } },
      { label: "Retention Rate", value: "89%", icon: <Repeat className="w-3 h-3" /> },
      { label: "Feature Depth", value: "72%", icon: <BarChart3 className="w-3 h-3" /> },
      { label: "→Operations", value: "12.4%", icon: <ArrowUpRight className="w-3 h-3" />, trend: { value: 1.8, positive: true } },
      { label: "MRR", value: "$13,436", icon: <DollarSign className="w-3 h-3" /> }
    ]
  },
  {
    tierId: "ai_operations",
    tierName: "AI Operations",
    tagline: "Your AI-powered back office.",
    icon: USER_TIERS.ai_operations.icon,
    color: USER_TIERS.ai_operations.color,
    kpis: [
      { label: "Subscribers", value: "156", icon: <Users className="w-3 h-3" />, trend: { value: 15.7, positive: true } },
      { label: "Workflow Usage", value: "89%", icon: <Activity className="w-3 h-3" /> },
      { label: "ARPU", value: "$112", icon: <DollarSign className="w-3 h-3" />, trend: { value: 8.2, positive: true } },
      { label: "Churn Rate", value: "2.4%", icon: <AlertCircle className="w-3 h-3" />, trend: { value: 0.3, positive: true } },
      { label: "Task Reduction", value: "64%", icon: <TrendingUp className="w-3 h-3" /> },
      { label: "MRR", value: "$15,599", icon: <DollarSign className="w-3 h-3" /> }
    ]
  },
  {
    tierId: "ai_enterprise",
    tierName: "AI Enterprise",
    tagline: "Scalable intelligence for organizations.",
    icon: USER_TIERS.ai_enterprise.icon,
    color: USER_TIERS.ai_enterprise.color,
    kpis: [
      { label: "Accounts", value: "47", icon: <Users className="w-3 h-3" />, trend: { value: 22.4, positive: true } },
      { label: "Seats/Account", value: "8.4", icon: <UserPlus className="w-3 h-3" /> },
      { label: "ACV", value: "$5,988", icon: <DollarSign className="w-3 h-3" /> },
      { label: "Expansion Rev", value: "+18%", icon: <ArrowUpRight className="w-3 h-3" />, trend: { value: 4.2, positive: true } },
      { label: "Renewal Rate", value: "94%", icon: <Repeat className="w-3 h-3" /> },
      { label: "MRR", value: "$23,453", icon: <DollarSign className="w-3 h-3" /> }
    ]
  },
  {
    tierId: "ai_advisory",
    tierName: "AI Advisory",
    tagline: "Human expertise, strategically deployed.",
    icon: USER_TIERS.ai_advisory.icon,
    color: USER_TIERS.ai_advisory.color,
    kpis: [
      { label: "Subscribers", value: "89", icon: <Users className="w-3 h-3" />, trend: { value: 18.9, positive: true } },
      { label: "Sessions/Client", value: "3.2/qtr", icon: <Calendar className="w-3 h-3" /> },
      { label: "Advisor Util.", value: "78%", icon: <Clock className="w-3 h-3" /> },
      { label: "Rev/User", value: "$224", icon: <DollarSign className="w-3 h-3" />, trend: { value: 6.1, positive: true } },
      { label: "Satisfaction", value: "4.8/5", icon: <Target className="w-3 h-3" /> },
      { label: "MRR", value: "$17,799", icon: <DollarSign className="w-3 h-3" /> }
    ]
  },
  {
    tierId: "ai_tax",
    tierName: "AI Tax",
    tagline: "One meeting. One year. Fully prepared.",
    icon: USER_TIERS.ai_tax.icon,
    color: USER_TIERS.ai_tax.color,
    kpis: [
      { label: "Clients", value: "234", icon: <Users className="w-3 h-3" />, trend: { value: 28.6, positive: true } },
      { label: "Doc Readiness", value: "82%", icon: <FileText className="w-3 h-3" />, trend: { value: 5.4, positive: true } },
      { label: "Meeting Compl.", value: "96%", icon: <Calendar className="w-3 h-3" /> },
      { label: "Seasonal Ret.", value: "87%", icon: <Repeat className="w-3 h-3" /> },
      { label: "Cross-sell", value: "15.7%", icon: <ArrowUpRight className="w-3 h-3" /> },
      { label: "MRR", value: "$35,097", icon: <DollarSign className="w-3 h-3" /> }
    ]
  },
  {
    tierId: "ai_compliance",
    tierName: "AI Compliance",
    tagline: "Stay compliant without chasing deadlines.",
    icon: USER_TIERS.ai_compliance.icon,
    color: USER_TIERS.ai_compliance.color,
    kpis: [
      { label: "Subscribers", value: "112", icon: <Users className="w-3 h-3" />, trend: { value: 14.2, positive: true } },
      { label: "Active Tasks", value: "847", icon: <Activity className="w-3 h-3" /> },
      { label: "Risk Flags/Acct", value: "2.1", icon: <AlertCircle className="w-3 h-3" />, trend: { value: 0.4, positive: true } },
      { label: "Retention", value: "91%", icon: <Repeat className="w-3 h-3" /> },
      { label: "Enterprise Att.", value: "24%", icon: <ArrowUpRight className="w-3 h-3" /> },
      { label: "MRR", value: "$20,159", icon: <DollarSign className="w-3 h-3" /> }
    ]
  }
];

// Calculate platform totals
const totalMRR = 125543; // Sum of all tier MRRs
const totalUsers = 2269;
const avgRetention = 88.7;

export function TierMetrics() {
  const navigate = useNavigate();

  const handlePortalClick = (tierId: UserTierId) => {
    navigate(`/portal/${tierId}`);
  };

  return (
    <div className="space-y-6">
      {/* Platform Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Platform MRR</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${totalMRR.toLocaleString()}</p>
          <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +12.4% vs last month
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalUsers.toLocaleString()}</p>
          <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +186 this month
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Repeat className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Avg Retention</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{avgRetention}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Product Types</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{tierMetrics.length}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">User Type Portals</h3>
          <p className="text-sm text-muted-foreground">Owner Dashboard KPIs by product tier</p>
        </div>
        <button className="text-xs text-primary hover:text-primary/80 font-medium">
          View Full Report →
        </button>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {tierMetrics.map((tier, index) => (
          <motion.div
            key={tier.tierId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handlePortalClick(tier.tierId)}
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
                    {tier.tierName}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate">{tier.tagline}</p>
                </div>
              </div>
            </div>

            {/* KPIs Grid */}
            <div className="p-3 grid grid-cols-2 gap-2">
              {tier.kpis.map((kpi, kpiIndex) => (
                <div 
                  key={kpiIndex} 
                  className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                    {kpi.icon}
                    <span className="text-[9px] uppercase tracking-wide truncate">{kpi.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-foreground text-sm">
                      {kpi.value}
                    </p>
                    {kpi.trend && (
                      <span className={cn(
                        "text-[10px] flex items-center gap-0.5",
                        kpi.trend.positive ? "text-green-500" : "text-red-500"
                      )}>
                        <TrendingUp className="w-2.5 h-2.5" />
                        {kpi.trend.value}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Gradient overlay */}
            <div className={cn(
              "absolute inset-0 opacity-5 bg-gradient-to-br pointer-events-none group-hover:opacity-10 transition-opacity",
              tier.color
            )} />
          </motion.div>
        ))}
      </div>

      {/* Platform Rules Notice */}
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