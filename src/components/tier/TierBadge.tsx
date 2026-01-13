import { useUserTier, UserTierId } from "@/contexts/UserTierContext";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Gift, Building2, TrendingUp, FileText, Shield } from "lucide-react";

interface TierBadgeProps {
  tierId?: UserTierId;
  size?: "sm" | "md" | "lg";
  showPrice?: boolean;
  className?: string;
}

export function TierBadge({ 
  tierId, 
  size = "sm", 
  showPrice = false,
  className 
}: TierBadgeProps) {
  const { currentTier, getTierById } = useUserTier();
  const tier = tierId ? getTierById(tierId) : currentTier;
  
  if (!tier) return null;

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2"
  };

  const iconSize = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4"
  };

  const getIcon = () => {
    switch (tier.id) {
      case "free":
        return <Gift className={iconSize[size]} />;
      case "ai_assistant":
        return <Sparkles className={iconSize[size]} />;
      case "ai_operations":
        return <Zap className={iconSize[size]} />;
      case "ai_enterprise":
        return <Building2 className={iconSize[size]} />;
      case "ai_advisory":
        return <TrendingUp className={iconSize[size]} />;
      case "ai_tax":
        return <FileText className={iconSize[size]} />;
      case "ai_compliance":
        return <Shield className={iconSize[size]} />;
    }
  };

  const getColorClasses = () => {
    switch (tier.id) {
      case "free":
        return "bg-muted text-muted-foreground";
      case "ai_assistant":
        return "bg-blue-500/20 text-blue-400";
      case "ai_operations":
        return "bg-purple-500/20 text-purple-400";
      case "ai_enterprise":
        return "bg-primary/20 text-primary";
      case "ai_advisory":
        return "bg-emerald-500/20 text-emerald-400";
      case "ai_tax":
        return "bg-amber-500/20 text-amber-400";
      case "ai_compliance":
        return "bg-rose-500/20 text-rose-400";
    }
  };

  return (
    <div className={cn(
      "inline-flex items-center rounded-full font-medium",
      sizeClasses[size],
      getColorClasses(),
      className
    )}>
      {getIcon()}
      <span>{tier.displayName}</span>
      {showPrice && tier.price !== null && (
        <span className="opacity-75">
          ${tier.price}/mo
        </span>
      )}
    </div>
  );
}