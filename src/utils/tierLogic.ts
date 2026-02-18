// src/utils/tierLogic.ts
// Tier and stage-based access control logic

export type Tier = 'FREE' | 'ASSIST' | 'OPS' | 'HUMAN-LED' | 'OWNER';
export type Stage = 'foundations' | 'growth' | 'scale';

export interface TierConfig {
  tier: Tier;
  stage: Stage;
  industry: string;
}

export interface PageAccess {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: Tier;
  stageRequired?: Stage;
}

// Tier hierarchy (higher number = more access)
const TIER_HIERARCHY: Record<Tier, number> = {
  'FREE': 1,
  'ASSIST': 2,
  'OPS': 3,
  'HUMAN-LED': 4,
  'OWNER': 5,
};

// Stage hierarchy
const STAGE_HIERARCHY: Record<Stage, number> = {
  'foundations': 1,
  'growth': 2,
  'scale': 3,
};

// Page access requirements
export const PAGE_REQUIREMENTS: Record<string, { minTier: Tier; minStage?: Stage; description: string }> = {
  // FREE tier pages (everyone)
  '/dashboard': { minTier: 'FREE', description: 'Morning Briefing Dashboard' },
  '/vopsy': { minTier: 'FREE', description: 'VOPSy AI Assistant' },
  '/academy': { minTier: 'FREE', description: 'Business Academy' },
  '/integrations': { minTier: 'FREE', description: 'Connect Your Tools' },
  
  // ASSIST tier pages
  '/people': { minTier: 'ASSIST', minStage: 'foundations', description: 'Contact Management' },
  '/pipeline': { minTier: 'ASSIST', minStage: 'foundations', description: 'Sales Pipeline' },
  '/campaigns': { minTier: 'ASSIST', minStage: 'foundations', description: 'Marketing Campaigns' },
  '/audience': { minTier: 'ASSIST', minStage: 'foundations', description: 'Audience Insights' },
  '/inbox': { minTier: 'ASSIST', minStage: 'foundations', description: 'Unified Inbox' },
  
  // OPS tier pages
  '/reconciliation': { minTier: 'OPS', minStage: 'foundations', description: 'Financial Reconciliation' },
  '/tax': { minTier: 'OPS', minStage: 'foundations', description: 'Tax Organizer' },
  '/reports': { minTier: 'OPS', minStage: 'growth', description: 'Financial Reports' },
  '/cash-flow': { minTier: 'OPS', minStage: 'growth', description: 'Cash Flow Management' },
  '/banking': { minTier: 'OPS', minStage: 'growth', description: 'Banking Dashboard' },
  '/roles': { minTier: 'OPS', minStage: 'growth', description: 'Team Roles & Permissions' },
  '/contractors': { minTier: 'OPS', minStage: 'growth', description: 'Contractor Management' },
  '/payroll': { minTier: 'OPS', minStage: 'growth', description: 'Payroll Processing' },
  
  // HUMAN-LED tier pages
  '/hr-compliance': { minTier: 'HUMAN-LED', minStage: 'growth', description: 'HR Compliance' },
  '/onboarding-documents': { minTier: 'HUMAN-LED', minStage: 'growth', description: 'Employee Onboarding' },
  '/api-connections': { minTier: 'HUMAN-LED', minStage: 'scale', description: 'API Management' },
  '/webhooks': { minTier: 'HUMAN-LED', minStage: 'scale', description: 'Webhook Configuration' },
  '/ai-process-triggers': { minTier: 'HUMAN-LED', minStage: 'scale', description: 'AI Process Automation' },
  '/system-logs': { minTier: 'HUMAN-LED', minStage: 'scale', description: 'System Logs & Monitoring' },
  
  // OWNER tier pages (full access)
  '/vault': { minTier: 'OWNER', description: 'Document Vault' },
  '/settings': { minTier: 'OWNER', description: 'Platform Settings' },
  '/owner-billing': { minTier: 'OWNER', description: 'Billing & Subscriptions' },
  '/managed-partners': { minTier: 'OWNER', description: 'Managed Partners' },
  
  // Tools (available to all tiers, but features vary)
  '/calendar': { minTier: 'FREE', description: 'Calendar' },
  '/tasks': { minTier: 'FREE', description: 'Task Manager' },
};

// Check if user has access to a page
export function checkPageAccess(
  pagePath: string,
  userConfig: TierConfig
): PageAccess {
  const requirement = PAGE_REQUIREMENTS[pagePath];
  
  // Page not found in requirements = allow by default (public page)
  if (!requirement) {
    return { allowed: true };
  }
  
  const userTierLevel = TIER_HIERARCHY[userConfig.tier];
  const requiredTierLevel = TIER_HIERARCHY[requirement.minTier];
  
  // Check tier requirement
  if (userTierLevel < requiredTierLevel) {
    return {
      allowed: false,
      reason: `This feature requires ${requirement.minTier} tier or higher.`,
      upgradeRequired: requirement.minTier,
    };
  }
  
  // Check stage requirement (if specified)
  if (requirement.minStage) {
    const userStageLevel = STAGE_HIERARCHY[userConfig.stage];
    const requiredStageLevel = STAGE_HIERARCHY[requirement.minStage];
    
    if (userStageLevel < requiredStageLevel) {
      return {
        allowed: false,
        reason: `This feature is unlocked in the "${requirement.minStage}" stage. Complete your current stage to unlock.`,
        stageRequired: requirement.minStage,
      };
    }
  }
  
  return { allowed: true };
}

// Get all locked pages for a user
export function getLockedPages(userConfig: TierConfig): string[] {
  const locked: string[] = [];
  
  for (const [path, requirement] of Object.entries(PAGE_REQUIREMENTS)) {
    const access = checkPageAccess(path, userConfig);
    if (!access.allowed) {
      locked.push(path);
    }
  }
  
  return locked;
}

// Get all unlocked pages for a user
export function getUnlockedPages(userConfig: TierConfig): string[] {
  const unlocked: string[] = [];
  
  for (const [path, requirement] of Object.entries(PAGE_REQUIREMENTS)) {
    const access = checkPageAccess(path, userConfig);
    if (access.allowed) {
      unlocked.push(path);
    }
  }
  
  return unlocked;
}

// Get next tier to unlock more features
export function getNextTier(currentTier: Tier): Tier | null {
  const tiers: Tier[] = ['FREE', 'ASSIST', 'OPS', 'HUMAN-LED', 'OWNER'];
  const currentIndex = tiers.indexOf(currentTier);
  
  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null; // Already at highest tier
  }
  
  return tiers[currentIndex + 1];
}

// Get next stage to unlock more features
export function getNextStage(currentStage: Stage): Stage | null {
  const stages: Stage[] = ['foundations', 'growth', 'scale'];
  const currentIndex = stages.indexOf(currentStage);
  
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null; // Already at highest stage
  }
  
  return stages[currentIndex + 1];
}

// Get features unlocked by upgrading to next tier
export function getFeaturesUnlockedByUpgrade(
  currentTier: Tier,
  targetTier: Tier
): string[] {
  const targetTierLevel = TIER_HIERARCHY[targetTier];
  const features: string[] = [];
  
  for (const [path, requirement] of Object.entries(PAGE_REQUIREMENTS)) {
    const requiredTierLevel = TIER_HIERARCHY[requirement.minTier];
    
    if (requiredTierLevel === targetTierLevel) {
      features.push(requirement.description);
    }
  }
  
  return features;
}

// Get features unlocked by advancing to next stage
export function getFeaturesUnlockedByStage(
  currentStage: Stage,
  targetStage: Stage
): string[] {
  const targetStageLevel = STAGE_HIERARCHY[targetStage];
  const features: string[] = [];
  
  for (const [path, requirement] of Object.entries(PAGE_REQUIREMENTS)) {
    if (requirement.minStage) {
      const requiredStageLevel = STAGE_HIERARCHY[requirement.minStage];
      
      if (requiredStageLevel === targetStageLevel) {
        features.push(requirement.description);
      }
    }
  }
  
  return features;
}

// Check if feature is available in user's tier
export function isFeatureAvailable(
  featureName: string,
  userConfig: TierConfig
): boolean {
  // Find the page path for this feature
  const pagePath = Object.keys(PAGE_REQUIREMENTS).find(
    path => PAGE_REQUIREMENTS[path].description === featureName
  );
  
  if (!pagePath) {
    return true; // Feature not found = allow by default
  }
  
  const access = checkPageAccess(pagePath, userConfig);
  return access.allowed;
}

// Get tier pricing (for upgrade prompts)
export const TIER_PRICING: Record<Tier, { monthly: number; annual: number; description: string }> = {
  'FREE': {
    monthly: 0,
    annual: 0,
    description: 'Basic access to VOPSy and Academy',
  },
  'ASSIST': {
    monthly: 97,
    annual: 970,
    description: 'AI-powered assistance for daily operations',
  },
  'OPS': {
    monthly: 297,
    annual: 2970,
    description: 'Full operational automation and insights',
  },
  'HUMAN-LED': {
    monthly: 997,
    annual: 9970,
    description: 'Human expert support + full platform access',
  },
  'OWNER': {
    monthly: 0,
    annual: 0,
    description: 'Platform owner - full access',
  },
};
