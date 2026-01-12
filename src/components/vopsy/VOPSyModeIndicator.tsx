import { cn } from "@/lib/utils";
import { useVOPSyMode } from "@/contexts/VOPSyModeContext";
import { Sparkles, Shield, AlertCircle } from "lucide-react";

interface VOPSyModeIndicatorProps {
  showFullName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VOPSyModeIndicator({ 
  showFullName = false, 
  size = "sm",
  className 
}: VOPSyModeIndicatorProps) {
  const { currentMode } = useVOPSyMode();

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5"
  };

  const getRiskBadge = () => {
    switch (currentMode.riskLevel) {
      case "high":
        return <Shield className="w-3 h-3" />;
      case "medium":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Sparkles className="w-3 h-3" />;
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-1.5 rounded-full font-medium",
      sizeClasses[size],
      currentMode.riskLevel === "high" 
        ? "bg-primary/20 text-primary" 
        : currentMode.riskLevel === "medium"
        ? "bg-warning/20 text-warning"
        : "bg-muted text-muted-foreground",
      className
    )}>
      {getRiskBadge()}
      <span>
        {showFullName ? currentMode.fullName : `VOPSy (${currentMode.name})`}
      </span>
    </div>
  );
}

interface ModeAttributionProps {
  action: "Response" | "Draft" | "Task" | "Analysis" | "Recommendation";
  className?: string;
}

export function VOPSyModeAttribution({ action, className }: ModeAttributionProps) {
  const { currentMode } = useVOPSyMode();
  
  return (
    <p className={cn(
      "text-[10px] text-muted-foreground font-medium",
      className
    )}>
      {action} by: {currentMode.fullName}
    </p>
  );
}
