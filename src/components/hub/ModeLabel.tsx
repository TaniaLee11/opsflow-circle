import { Badge } from "@/components/ui/badge";

interface ModeLabelProps {
  tier: string;
  className?: string;
}

export function ModeLabel({ tier, className }: ModeLabelProps) {
  const modes: Record<string, { icon: string; label: string; description: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    free: { 
      icon: "📚", 
      label: "Education", 
      description: "Learn at your own pace",
      variant: "secondary"
    },
    ai_tax: { 
      icon: "📚", 
      label: "Education", 
      description: "Learn at your own pace",
      variant: "secondary"
    },
    ai_compliance: { 
      icon: "📚", 
      label: "Education", 
      description: "Learn at your own pace",
      variant: "secondary"
    },
    ai_assistant: { 
      icon: "🧭", 
      label: "Guided", 
      description: "VOPSy directs, you act",
      variant: "outline"
    },
    ai_operations: { 
      icon: "⚡", 
      label: "Execution", 
      description: "VOPSy automates for you",
      variant: "default"
    },
    ai_enterprise: { 
      icon: "⚡", 
      label: "Execution", 
      description: "VOPSy automates for you",
      variant: "default"
    },
    cohort: { 
      icon: "⚡", 
      label: "Execution", 
      description: "VOPSy automates for you",
      variant: "default"
    },
    ai_advisory: { 
      icon: "👤", 
      label: "Led", 
      description: "Tania leads strategy",
      variant: "destructive"
    },
    owner: { 
      icon: "👤", 
      label: "Led", 
      description: "Full platform control",
      variant: "destructive"
    }
  };
  
  const mode = modes[tier] || modes.free;
  
  return (
    <Badge variant={mode.variant} className={className}>
      <span className="mr-1">{mode.icon}</span>
      <span className="font-semibold">{mode.label}</span>
      <span className="mx-2">—</span>
      <span className="font-normal">{mode.description}</span>
    </Badge>
  );
}

export function getTierMode(tier: string): "education" | "guided" | "execution" | "led" {
  if (["free", "ai_tax", "ai_compliance"].includes(tier)) return "education";
  if (tier === "ai_assistant") return "guided";
  if (["ai_operations", "ai_enterprise", "cohort"].includes(tier)) return "execution";
  if (["ai_advisory", "owner"].includes(tier)) return "led";
  return "education";
}
