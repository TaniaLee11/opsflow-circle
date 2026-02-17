// Permission system for page access and feature availability
// Based on tech tier, stage, and industry

import { resolveTechTier, type PlanName, type TechTier } from './tierResolver';

export interface UserContext {
  plan: PlanName;
  stage: 'foundations' | 'operating' | 'growing';
  industry: 'owner' | 'contractor' | 'nonprofit' | 'business';
  role?: 'owner' | 'user';
}

// Stage-locked pages by stage
const stageLocks: Record<string, string[]> = {
  foundations: [
    'dashboard', 'vopsy', 'academy',
    'banking', 'cashflow',
    'integrations', 'workflows', 'calendar', 'tasks', 'vault',
  ],
  operating: [
    // Foundations pages PLUS:
    'reconciliation', 'tax', 'reports',
    'campaigns', 'audience',
    'people', 'pipeline', 'documents', 'inbox', 'followups', 'surveys',
    'marketing', 'engagement', 'finance', 'systems',
  ],
  growing: [
    // Operating pages PLUS:
    'funding',
    'contractors', 'payroll',
    'team',  // People department dashboard
  ],
};

/**
 * Check if user can access a specific page
 * Owner sees everything, others are stage-locked
 */
export function canAccessPage(page: string, user: UserContext): boolean {
  const tier = resolveTechTier(user.plan);
  
  // Owner sees EVERYTHING — no locks, no stages
  if (tier === 'owner' || user.role === 'owner') return true;
  
  // Build cumulative access list based on stage
  let accessible: string[] = [];
  
  if (user.stage === 'foundations') {
    accessible = stageLocks.foundations;
  } else if (user.stage === 'operating') {
    accessible = [...stageLocks.foundations, ...stageLocks.operating];
  } else if (user.stage === 'growing') {
    accessible = [...stageLocks.foundations, ...stageLocks.operating, ...stageLocks.growing];
  }
  
  // Industry-specific unlocks
  if (user.industry === 'nonprofit') {
    accessible.push('grants');
    // Nonprofits get funding readiness at operating stage
    if (user.stage === 'operating' || user.stage === 'growing') {
      accessible.push('funding');
    }
  }
  
  return accessible.includes(page);
}

/**
 * Does VOPSy run batch processing for this user?
 */
export function hasBatchProcessing(plan: PlanName): boolean {
  const tier = resolveTechTier(plan);
  return ['assist', 'ops', 'human-led', 'owner'].includes(tier);
}

/**
 * Can Manus take actions for this user?
 */
export function hasManusActions(plan: PlanName): boolean {
  const tier = resolveTechTier(plan);
  return ['ops', 'human-led', 'owner'].includes(tier);
}

/**
 * Get the stage that unlocks a specific page
 */
export function getUnlockStage(page: string): 'foundations' | 'operating' | 'growing' | null {
  if (stageLocks.foundations.includes(page)) return 'foundations';
  if (stageLocks.operating.includes(page)) return 'operating';
  if (stageLocks.growing.includes(page)) return 'growing';
  return null;
}
