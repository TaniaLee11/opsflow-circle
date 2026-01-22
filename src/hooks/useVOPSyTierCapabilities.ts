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

// Map UserTierId to VOPSyTier
function mapTierToVOPSyTier(tierId: UserTierId | string | null): VOPSyTier {
  if (!tierId) return 'free';
  
  switch (tierId) {
    case 'free':
      return 'free';
    case 'ai_assistant':
      return 'assistant';
    case 'ai_operations':
    case 'ai_enterprise':
    case 'ai_advisory':
    case 'ai_tax':
    case 'ai_compliance':
      return 'operations';
    default:
      // Handle cohort and owner as operations-level
      if (tierId === 'cohort' || tierId === 'owner') {
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
 * VOPSy always exists as the intelligence layer, but what it can DO depends on tier.
 * - AI Free: Orientation, thinking, document interaction. No integrations, no execution.
 * - AI Assistant: Read-only intelligence. Can analyze and recommend, cannot execute.
 * - AI Operations: Full execution authority. Can read, write, and execute.
 */
export function useVOPSyTierCapabilities() {
  const { currentTier } = useUserTier();
  const { isOwner, accessType } = useAuth();

  const vopsyTier = useMemo<VOPSyTier>(() => {
    // Owner always has full access
    if (isOwner) return 'operations';
    
    // Map based on access type and tier
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
