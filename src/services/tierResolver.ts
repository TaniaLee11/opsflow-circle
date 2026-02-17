// Tier resolution system
// Maps user-facing plan names to technical tiers that determine system behavior

export type PlanName = 'free' | 'tax' | 'assist' | 'compliance' | 'ops' | 'advisory' | 'cohort' | 'human-led' | 'owner';
export type TechTier = 'free' | 'assist' | 'ops' | 'human-led' | 'owner';

/**
 * Resolves a user's plan name to their technical tier
 * This determines system behavior, not UI labels
 */
export function resolveTechTier(plan: PlanName): TechTier {
  switch (plan) {
    case 'free':
    case 'tax':
      return 'free';
    
    case 'assist':
    case 'compliance':
      return 'assist';
    
    case 'ops':
    case 'advisory':
    case 'cohort':
      return 'ops';
    
    case 'human-led':
      return 'human-led';
    
    case 'owner':
      return 'owner';
    
    default:
      return 'free';  // safe default
  }
}

/**
 * Gets the voice that should be used in insights
 * Human-Led tier credits Tania, all others credit VOPSy
 */
export function getInsightVoice(plan: PlanName): 'vopsy' | 'tania' {
  const tier = resolveTechTier(plan);
  return tier === 'human-led' ? 'tania' : 'vopsy';
}
