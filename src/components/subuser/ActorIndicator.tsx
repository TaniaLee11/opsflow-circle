import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIAgent } from "@/contexts/SubUserContext";

interface ActorIndicatorProps {
  agent?: AIAgent;
  action: "speaking" | "responding" | "drafting" | "executing" | "analyzing";
  size?: "sm" | "md" | "lg";
}

const actionLabels = {
  speaking: "Response by",
  responding: "Response by",
  drafting: "Draft created by",
  executing: "Task executed by",
  analyzing: "Analysis by"
};

export function ActorIndicator({ agent, action, size = "sm" }: ActorIndicatorProps) {
  if (!agent) return null;

  const sizeClasses = {
    sm: "text-xs gap-1.5 px-2 py-1",
    md: "text-sm gap-2 px-3 py-1.5",
    lg: "text-base gap-2 px-4 py-2"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "inline-flex items-center rounded-full bg-muted/50 border border-border",
        sizeClasses[size]
      )}
    >
      <div className={cn(
        "rounded-md bg-gradient-to-br flex items-center justify-center",
        iconSizes[size],
        agent.color
      )}>
        <span className="text-[10px]">{agent.icon}</span>
      </div>
      <span className="text-muted-foreground">{actionLabels[action]}:</span>
      <span className="font-medium text-foreground">{agent.name}</span>
    </motion.div>
  );
}

interface ActorBadgeProps {
  agent: AIAgent;
  showTitle?: boolean;
}

export function ActorBadge({ agent, showTitle = false }: ActorBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className={cn(
        "w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center text-xs",
        agent.color
      )}>
        {agent.icon}
      </div>
      <div>
        <span className="font-medium text-foreground text-sm">{agent.name}</span>
        {showTitle && (
          <p className="text-xs text-muted-foreground">{agent.title}</p>
        )}
      </div>
    </div>
  );
}
