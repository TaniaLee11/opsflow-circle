// Tier Resolver: 7 plan names → 3 tech tiers
// NO pricing visible in UI

export type PlanName = 
  | 'AI Free' 
  | 'AI Tax' 
  | 'AI Assistant' 
  | 'AI Compliance' 
  | 'AI Operations' 
  | 'AI Advisory'  // Human-Led
  | 'AI Cohort'
  | 'Owner';

export type TechTier = 'FREE' | 'ASSIST' | 'OPS';

export interface TierInfo {
  techTier: TechTier;
  isHumanLed: boolean;  // AI Advisory credits Tania, not VOPSy
  isOwner: boolean;     // Tania - all access, no locks
  displayName: string;
}

export function resolveTier(planName: PlanName | null | undefined): TierInfo {
  // Owner (Tania) - OPS behavior, all access
  if (planName === 'Owner') {
    return {
      techTier: 'OPS',
      isHumanLed: false,
      isOwner: true,
      displayName: 'Owner',
    };
  }

  // AI Advisory (Human-Led) - OPS display, credits Tania
  if (planName === 'AI Advisory') {
    return {
      techTier: 'OPS',
      isHumanLed: true,
      isOwner: false,
      displayName: 'AI Advisory',
    };
  }

  // FREE tier
  if (planName === 'AI Free' || planName === 'AI Tax') {
    return {
      techTier: 'FREE',
      isHumanLed: false,
      isOwner: false,
      displayName: planName || 'AI Free',
    };
  }

  // ASSIST tier
  if (planName === 'AI Assistant' || planName === 'AI Compliance') {
    return {
      techTier: 'ASSIST',
      isHumanLed: false,
      isOwner: false,
      displayName: planName || 'AI Assistant',
    };
  }

  // OPS tier
  if (planName === 'AI Operations' || planName === 'AI Cohort') {
    return {
      techTier: 'OPS',
      isHumanLed: false,
      isOwner: false,
      displayName: planName || 'AI Operations',
    };
  }

  // Default to FREE if no plan
  return {
    techTier: 'FREE',
    isHumanLed: false,
    isOwner: false,
    displayName: 'AI Free',
  };
}

// Feature access by tech tier
export const TIER_FEATURES = {
  FREE: {
    canAccessDashboard: true,
    canAccessAcademy: true,
    canAccessVOPSy: true,  // VOPSy teaches, manual only
    canAccessMarketing: false,
    canAccessEngagement: false,
    canAccessFinance: false,
    canAccessSystems: false,
    canAccessPeople: false,
    canAccessTools: false,
  },
  ASSIST: {
    canAccessDashboard: true,
    canAccessAcademy: true,
    canAccessVOPSy: true,  // VOPSy advises with data
    canAccessMarketing: true,
    canAccessEngagement: true,
    canAccessFinance: true,
    canAccessSystems: true,
    canAccessPeople: true,
    canAccessTools: false,
  },
  OPS: {
    canAccessDashboard: true,
    canAccessAcademy: true,
    canAccessVOPSy: true,  // VOPSy operates, Manus acts
    canAccessMarketing: true,
    canAccessEngagement: true,
    canAccessFinance: true,
    canAccessSystems: true,
    canAccessPeople: true,
    canAccessTools: true,
  },
};

export function canAccessFeature(tierInfo: TierInfo, feature: keyof typeof TIER_FEATURES.FREE): boolean {
  // Owner has access to everything
  if (tierInfo.isOwner) return true;
  
  // Check tier-based access
  return TIER_FEATURES[tierInfo.techTier][feature];
}

// Stage locking (for non-owner users)
export type Stage = 'Foundations' | 'Growth' | 'Scale';

export function getUnlockedStages(tierInfo: TierInfo): Stage[] {
  // Owner has all stages unlocked
  if (tierInfo.isOwner) return ['Foundations', 'Growth', 'Scale'];

  // All other tiers follow stage progression
  switch (tierInfo.techTier) {
    case 'FREE':
      return ['Foundations'];
    case 'ASSIST':
      return ['Foundations', 'Growth'];
    case 'OPS':
      return ['Foundations', 'Growth', 'Scale'];
    default:
      return ['Foundations'];
  }
}

export function isStageUnlocked(tierInfo: TierInfo, stage: Stage): boolean {
  return getUnlockedStages(tierInfo).includes(stage);
}
