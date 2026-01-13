import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

// User AI Tiers - what a user/organization can do for themselves
export type UserTierId = "free" | "ai_assistant" | "ai_operations" | "ai_operations_full";

// Environment types
export type EnvironmentType = "production" | "cohort";

export interface UserTier {
  id: UserTierId;
  name: string;
  displayName: string;
  price: number | null; // null for free
  description: string;
  capabilities: string[];
  limitations: string[];
  icon: string;
  color: string;
}

export const USER_TIERS: Record<UserTierId, UserTier> = {
  free: {
    id: "free",
    name: "Free",
    displayName: "AI Free",
    price: null,
    description: "A guided introduction to smarter business operations — clarity without complexity",
    capabilities: [
      "Basic AI assistant support",
      "Starter business insights & prompts",
      "Limited access to operational tools",
      "Guided recommendations for next steps"
    ],
    limitations: [
      "No automation features",
      "No financial tools",
      "Limited action volume",
      "Upgrade to unlock full capabilities"
    ],
    icon: "🆓",
    color: "from-gray-500 to-gray-400"
  },
  ai_assistant: {
    id: "ai_assistant",
    name: "AI Assistant",
    displayName: "AI Assistant",
    price: 34.99,
    description: "Business plans, pitch decks, compliance checklists, and templates",
    capabilities: [
      "Business plans & pitch decks",
      "Compliance checklists",
      "Templates library",
      "Full LMS access",
      "Guided single-step AI execution",
      "Limited action volume"
    ],
    limitations: [
      "No automation orchestration",
      "No multi-step workflows",
      "No white-label",
      "No client management"
    ],
    icon: "💬",
    color: "from-blue-500 to-cyan-400"
  },
  ai_operations: {
    id: "ai_operations",
    name: "AI Operations",
    displayName: "AI Operations",
    price: 99.99,
    description: "Multi-step workflows with operational reasoning and automation",
    capabilities: [
      "Everything in AI Assistant",
      "Expanded AI actions",
      "Multi-step workflows",
      "Operational reasoning",
      "Iterative refinement",
      "Persistent context",
      "Automation execution"
    ],
    limitations: [
      "No white-label",
      "No firm dashboards",
      "No client resale"
    ],
    icon: "⚙️",
    color: "from-purple-500 to-pink-400"
  },
  ai_operations_full: {
    id: "ai_operations_full",
    name: "AI Operations Full",
    displayName: "AI Operations (Full)",
    price: 499,
    description: "Highest tier for regular users with full automation and LMS",
    capabilities: [
      "Full AI operations functionality",
      "Full automation availability",
      "Full LMS access",
      "Highest usage limits",
      "Organization-wide workflows",
      "Priority support"
    ],
    limitations: [
      "No white-label (requires Enterprise)",
      "No parent-child orgs",
      "No client resale",
      "No firm permissions"
    ],
    icon: "🚀",
    color: "from-primary to-orange-400"
  }
};

// Enterprise enablement - for firms only (overlay, not a tier)
export interface EnterpriseConfig {
  enabled: boolean;
  firmName?: string;
  whiteLabel?: {
    brandName: string;
    primaryColor?: string;
    logoUrl?: string;
  };
  clientOrganizations?: string[]; // IDs of client orgs
}

// Cohort configuration
export interface CohortConfig {
  isActive: boolean;
  expiresAt?: Date;
  inviteCode?: string;
}

interface UserTierContextType {
  // Current user's tier
  currentTier: UserTier;
  currentTierId: UserTierId;
  
  // Environment
  environment: EnvironmentType;
  isCohort: boolean;
  cohortConfig: CohortConfig | null;
  
  // Enterprise (for firms only)
  enterpriseConfig: EnterpriseConfig | null;
  isEnterpriseEnabled: boolean;
  
  // All tiers for display
  allTiers: UserTier[];
  
  // Actions
  setTier: (tierId: UserTierId) => void;
  canAccessFeature: (feature: string) => boolean;
  getTierById: (id: UserTierId) => UserTier | undefined;
  
  // Cohort actions
  exitCohort: (downgradeToTier: UserTierId | "exit") => void;
}

const UserTierContext = createContext<UserTierContextType | undefined>(undefined);

export function UserTierProvider({ children }: { children: ReactNode }) {
  const { user, isOwner } = useAuth();
  
  // In production, these would come from database/Stripe subscription
  const [currentTierId, setCurrentTierId] = useState<UserTierId>("ai_operations_full");
  const [environment, setEnvironment] = useState<EnvironmentType>("cohort"); // Demo: cohort environment
  
  const [cohortConfig, setCohortConfig] = useState<CohortConfig | null>({
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    inviteCode: "VOPS-COHORT-2024"
  });
  
  // Enterprise is ONLY for firms - regular users never have this
  const [enterpriseConfig, setEnterpriseConfig] = useState<EnterpriseConfig | null>(null);

  const currentTier = USER_TIERS[currentTierId];
  const isCohort = environment === "cohort";
  const isEnterpriseEnabled = enterpriseConfig?.enabled ?? false;
  const allTiers = Object.values(USER_TIERS);

  const setTier = (tierId: UserTierId) => {
    setCurrentTierId(tierId);
  };

  const canAccessFeature = (feature: string): boolean => {
    const tierLevel = {
      free: 0,
      ai_assistant: 1,
      ai_operations: 2,
      ai_operations_full: 3
    };
    
    const featureRequirements: Record<string, UserTierId> = {
      "ai_interaction": "free",
      "lms_preview": "free",
      "business_plans": "ai_assistant",
      "pitch_decks": "ai_assistant",
      "compliance_checklists": "ai_assistant",
      "templates": "ai_assistant",
      "lms_full": "ai_assistant",
      "guided_execution": "ai_assistant",
      "multi_step_workflows": "ai_operations",
      "automation_execution": "ai_operations",
      "persistent_context": "ai_operations",
      "full_automation": "ai_operations_full",
      "org_workflows": "ai_operations_full",
      "priority_support": "ai_operations_full"
    };
    
    const requiredTier = featureRequirements[feature] || "free";
    return tierLevel[currentTierId] >= tierLevel[requiredTier];
  };

  const getTierById = (id: UserTierId) => USER_TIERS[id];

  const exitCohort = (downgradeToTier: UserTierId | "exit") => {
    if (downgradeToTier === "exit") {
      // User chose to exit platform - in production, would trigger account cleanup
      setCohortConfig(null);
      setEnvironment("production");
      setCurrentTierId("free");
    } else {
      setCohortConfig(null);
      setEnvironment("production");
      setCurrentTierId(downgradeToTier);
    }
  };

  return (
    <UserTierContext.Provider value={{
      currentTier,
      currentTierId,
      environment,
      isCohort,
      cohortConfig,
      enterpriseConfig,
      isEnterpriseEnabled,
      allTiers,
      setTier,
      canAccessFeature,
      getTierById,
      exitCohort
    }}>
      {children}
    </UserTierContext.Provider>
  );
}

export function useUserTier() {
  const context = useContext(UserTierContext);
  if (context === undefined) {
    throw new Error("useUserTier must be used within a UserTierProvider");
  }
  return context;
}
