import { useMemo, useCallback } from 'react';
import { useUserTier, UserTierId } from '@/contexts/UserTierContext';
import { useAuth } from '@/contexts/AuthContext';

export type VOPSyCapability = 
  | 'chat'
  | 'upload_files'
  | 'download_files'
  | 'discuss_documents'
  | 'explain'
  | 'read_integrations'
  | 'analyze_data'
  | 'recommend'
  | 'write_integrations'
  | 'execute_tasks'
  | 'modify_workflows'
  | 'automation';

export type VOPSyTier = 'free' | 'assistant' | 'operations';

interface TierCapabilities {
  tier: VOPSyTier;
  displayName: string;
  capabilities: VOPSyCapability[];
  canRead: boolean;
  canWrite: boolean;
  canExecute: boolean;
}

const TIER_CAPABILITIES: Record<VOPSyTier, TierCapabilities> = {
  free: {
    tier: 'free',
    displayName: 'AI Free',
    capabilities: ['chat', 'upload_files', 'download_files', 'discuss_documents', 'explain'],
    canRead: false,
    canWrite: false,
    canExecute: false,
  },
  assistant: {
    tier: 'assistant',
    displayName: 'AI Assistant',
    capabilities: [
      'chat', 'upload_files', 'download_files', 'discuss_documents', 'explain',
      'read_integrations', 'analyze_data', 'recommend'
    ],
    canRead: true,
    canWrite: false,
    canExecute: false,
  },
  operations: {
    tier: 'operations',
    displayName: 'AI Operations',
    capabilities: [
      'chat', 'upload_files', 'download_files', 'discuss_documents', 'explain',
      'read_integrations', 'analyze_data', 'recommend',
      'write_integrations', 'execute_tasks', 'modify_workflows', 'automation'
    ],
    canRead: true,
    canWrite: true,
    canExecute: true,
  },
};

/**
 * FULL VOPSy EXECUTION — NON-NEGOTIABLE SYSTEM RULE
 * 
 * EXECUTION-ENABLED TIERS (can read, write, execute):
 * - AI Operations
 * - AI Compliance (specialized + full execution)
 * - AI Advisory (specialized + full execution)
 * - AI_COHORT (system-assigned, time-limited, mirrors AI Operations)
 * - AI Enterprise (AI Operations at scale)
 * - System Owner — ONLY inside their own autonomous environment
 * 
 * ADVISORY-ONLY WITH READ ACCESS:
 * - AI Assistant (can read integrations, analyze, recommend — NO execution)
 * - AI Tax (can read integrations, analyze tax data — NO execution)
 * 
 * NO EXECUTION — EVER:
 * - AI Free (guidance only)
 */
function mapTierToVOPSyTier(tierId: UserTierId | string | null): VOPSyTier {
  if (!tierId) return 'free';
  
  switch (tierId) {
    // === AI Free (Guidance only) ===
    case 'free':
      return 'free';
    
    // === Advisory-only with READ access (NO execution) ===
    case 'ai_assistant':
    case 'ai_tax': // AI Tax can READ integrations but NOT execute
      return 'assistant';
    
    // === Full Execution Authority ===
    case 'ai_operations':
    case 'ai_enterprise':
    case 'ai_advisory':    // Full execution + strategic planning
    case 'ai_compliance':  // Full execution + compliance monitoring
    // AI_COHORT gets FULL operations capabilities (system-assigned tier)
    case 'cohort':
    case 'AI_COHORT':
      return 'operations';
    
    default:
      // Handle owner as operations-level (in their own environment)
      if (tierId === 'owner') {
        return 'operations';
      }
      return 'free';
  }
}

export interface CapabilityCheckResult {
  allowed: boolean;
  reason?: string;
  suggestedTier?: VOPSyTier;
  upgradeMessage?: string;
}

/**
 * Hook to manage VOPSy tier-based capabilities.
 * 
 * FULL VOPSy EXECUTION — NON-NEGOTIABLE SYSTEM RULE
 * 
 * WHO MAY USE FULL VOPSy (EXECUTION ENABLED):
 * - AI Operations
 * - AI Compliance (full execution + compliance monitoring)
 * - AI Advisory (full execution + strategic planning)
 * - AI_COHORT (system-assigned, time-limited, mirrors AI Operations)
 * - AI Enterprise (AI Operations at scale)
 * - System Owner — ONLY inside their own autonomous environment
 * 
 * ADVISORY-ONLY WITH READ ACCESS:
 * - AI Assistant: Can read integrations, analyze, recommend — NO execution
 * - AI Tax: Can read integrations, analyze tax data — NO execution
 * 
 * NO EXECUTION — EVER:
 * - AI Free: Guidance only (chat, explain, documents)
 * 
 * SYSTEM OWNER CLARIFICATION (CRITICAL):
 * - In their OWN environment: Full execution authority
 * - For OTHER users: Analytics oversight only (NO execution, NO raw data)
 * 
 * ENFORCEMENT BEHAVIOR:
 * - If user without execution requests an action: explain, don't execute
 * - Offer guidance or describe next steps
 * - Never execute silently or auto-upgrade
 */
export function useVOPSyTierCapabilities() {
  const { currentTier } = useUserTier();
  const { isOwner, accessType } = useAuth();

  const vopsyTier = useMemo<VOPSyTier>(() => {
    // Owner always has full access (in their own environment)
    if (isOwner) return 'operations';
    
    // Cohort users get FULL operations capabilities (system-assigned)
    if (accessType === 'cohort') return 'operations';
    
    return mapTierToVOPSyTier(currentTier.id);
  }, [currentTier.id, isOwner, accessType]);

  const capabilities = useMemo(() => TIER_CAPABILITIES[vopsyTier], [vopsyTier]);

  // Check if a specific capability is allowed
  const hasCapability = useCallback((capability: VOPSyCapability): boolean => {
    return capabilities.capabilities.includes(capability);
  }, [capabilities]);

  // Check capability with detailed result
  const checkCapability = useCallback((capability: VOPSyCapability): CapabilityCheckResult => {
    if (hasCapability(capability)) {
      return { allowed: true };
    }

    // Determine which tier is needed
    let suggestedTier: VOPSyTier = 'operations';
    let upgradeMessage = '';

    if (['read_integrations', 'analyze_data', 'recommend'].includes(capability)) {
      suggestedTier = 'assistant';
      upgradeMessage = 'Upgrade to AI Assistant to enable read access';
    } else if (['write_integrations', 'execute_tasks', 'modify_workflows', 'automation'].includes(capability)) {
      suggestedTier = 'operations';
      upgradeMessage = 'Upgrade to AI Operations to enable execution';
    }

    const reason = vopsyTier === 'free'
      ? 'This requires integration access not available on the Free tier.'
      : 'This requires write/execution access not available on the Assistant tier.';

    return {
      allowed: false,
      reason,
      suggestedTier,
      upgradeMessage,
    };
  }, [hasCapability, vopsyTier]);

  // Get the appropriate response style based on tier
  const getResponseStyle = useCallback((requestType: 'read' | 'write' | 'execute'): 'explain' | 'advise' | 'execute' => {
    switch (requestType) {
      case 'read':
        return capabilities.canRead ? 'advise' : 'explain';
      case 'write':
      case 'execute':
        return capabilities.canExecute ? 'execute' : capabilities.canRead ? 'advise' : 'explain';
      default:
        return 'explain';
    }
  }, [capabilities]);

  // Generate tier-appropriate response prefix
  const getActionPrefix = useCallback((action: 'read' | 'write' | 'execute'): string => {
    const style = getResponseStyle(action);
    
    switch (style) {
      case 'explain':
        return "Here's how you can do this:";
      case 'advise':
        return "I analyzed the data. Here's what needs to be done:";
      case 'execute':
        return "Done. Here's what I did:";
    }
  }, [getResponseStyle]);

  return {
    tier: vopsyTier,
    tierDisplayName: capabilities.displayName,
    capabilities: capabilities.capabilities,
    canRead: capabilities.canRead,
    canWrite: capabilities.canWrite,
    canExecute: capabilities.canExecute,
    hasCapability,
    checkCapability,
    getResponseStyle,
    getActionPrefix,
  };
}
