import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VOPSyTier } from '@/hooks/useVOPSyTierCapabilities';

interface VOPSyUpgradeNudgeProps {
  currentTier: VOPSyTier;
  suggestedTier: VOPSyTier;
  context?: 'chat' | 'action' | 'integration';
  className?: string;
}

const TIER_UPGRADE_CONFIG: Record<VOPSyTier, { ctaText: string; benefit: string }> = {
  free: {
    ctaText: 'Enable read access',
    benefit: 'analyze connected tools',
  },
  assistant: {
    ctaText: 'Enable execution',
    benefit: 'execute actions automatically',
  },
  operations: {
    ctaText: 'Full access',
    benefit: 'full operational control',
  },
};

/**
 * A contextual, non-intrusive upgrade nudge for VOPSy.
 * 
 * Design principles:
 * - No popups, no modals, no forced interruptions
 * - Small, secondary button that appears at the end of relevant responses
 * - Visually subtle (ghost/secondary style)
 * - Never blocks guidance or degrades VOPSy's helpfulness
 */
export function VOPSyUpgradeNudge({
  currentTier,
  suggestedTier,
  context = 'chat',
  className,
}: VOPSyUpgradeNudgeProps) {
  // Don't show if already at or above suggested tier
  const tierOrder: VOPSyTier[] = ['free', 'assistant', 'operations'];
  const currentIndex = tierOrder.indexOf(currentTier);
  const suggestedIndex = tierOrder.indexOf(suggestedTier);
  
  if (currentIndex >= suggestedIndex) {
    return null;
  }

  const targetConfig = TIER_UPGRADE_CONFIG[suggestedTier];

  // Context-specific messaging
  const getMessage = () => {
    switch (context) {
      case 'integration':
        return targetConfig.ctaText;
      case 'action':
        return targetConfig.ctaText;
      default:
        return targetConfig.ctaText;
    }
  };

  const handleClick = () => {
    // Navigate to tier selection
    window.location.href = '/select-tier';
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        "h-auto py-1.5 px-3 text-xs font-normal",
        "text-muted-foreground hover:text-foreground",
        "border border-border/50 hover:border-primary/30",
        "transition-all duration-200",
        "gap-1.5",
        className
      )}
    >
      <span>{getMessage()}</span>
      <ArrowUpRight className="h-3 w-3" />
    </Button>
  );
}

interface VOPSyCapabilityMessageProps {
  canPerform: boolean;
  tier: VOPSyTier;
  suggestedTier: VOPSyTier;
  actionDescription: string;
  guidanceText?: string;
}

/**
 * A complete capability message with optional upgrade nudge.
 * Used when VOPSy cannot perform a requested action due to tier limitations.
 */
export function VOPSyCapabilityMessage({
  canPerform,
  tier,
  suggestedTier,
  actionDescription,
  guidanceText,
}: VOPSyCapabilityMessageProps) {
  if (canPerform) {
    return null;
  }

  return (
    <div className="space-y-3 mt-4 pt-4 border-t border-border/50">
      <p className="text-sm text-muted-foreground">
        {guidanceText || `I can walk you through ${actionDescription} step-by-step, but I can't perform this action directly on your behalf with your current access.`}
      </p>
      
      <p className="text-sm text-muted-foreground">
        If you'd like me to handle this automatically next time, there's an option to enable that.
      </p>

      <VOPSyUpgradeNudge
        currentTier={tier}
        suggestedTier={suggestedTier}
        context="action"
      />
    </div>
  );
}
