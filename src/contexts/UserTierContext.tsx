import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

// User AI Tiers / Product Types - purchasable products and portals
export type UserTierId = 
  | "free" 
  | "ai_assistant" 
  | "ai_operations" 
  | "ai_enterprise" 
  | "ai_advisory" 
  | "ai_tax" 
  | "ai_compliance";

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
    description: "Start organized. Move at your own pace.",
    capabilities: [
      "AI Vault — upload & store tax docs, business records",
      "AI Communications — reminders, prompts, guided steps",
      "AI LMS — business basics & planning education",
      "Business Plan Builder (DIY with AI prompts)",
      "Input → Output (upload docs → generate plans/exports)"
    ],
    limitations: [
      "No year-round tax prep",
      "No ongoing advisory",
      "No compliance execution or filings"
    ],
    icon: "🆓",
    color: "from-gray-500 to-gray-400"
  },
  ai_assistant: {
    id: "ai_assistant",
    name: "AI Assistant",
    displayName: "AI Assistant",
    price: 34.99,
    description: "Guidance while you run the business.",
    capabilities: [
      "Full AI assistant (daily decision support)",
      "AI Vault (expanded usage)",
      "AI LMS (role- and stage-based)",
      "Business planning & document analysis",
      "Smart reminders (deadlines, renewals, follow-ups)",
      "Input → Output across finance, admin, ops"
    ],
    limitations: [
      "No automation orchestration",
      "No operational dashboards",
      "No tool integrations"
    ],
    icon: "💬",
    color: "from-blue-500 to-cyan-400"
  },
  ai_operations: {
    id: "ai_operations",
    name: "AI Operations",
    displayName: "AI Operations",
    price: 99.99,
    description: "Your AI-powered back office.",
    capabilities: [
      "Everything in AI Assistant",
      "Operational dashboards (cash flow, forecasting)",
      "Automated workflows (billing, reminders, reporting)",
      "Tool integrations (accounting, CRM, payroll)",
      "Compliance tracking (not filing)",
      "Input → Output across all operational workflows"
    ],
    limitations: [
      "Single-entity focus",
      "No multi-user access",
      "No advisory sessions included"
    ],
    icon: "⚙️",
    color: "from-purple-500 to-pink-400"
  },
  ai_enterprise: {
    id: "ai_enterprise",
    name: "AI Enterprise",
    displayName: "AI Enterprise",
    price: 499,
    description: "Scalable intelligence for organizations.",
    capabilities: [
      "Multi-user access & permissions",
      "Multi-entity management",
      "Advanced analytics & reporting",
      "Governance & audit trails",
      "Enterprise-grade integrations & security",
      "Priority support"
    ],
    limitations: [
      "Annual commitment required",
      "Custom onboarding process"
    ],
    icon: "🏢",
    color: "from-primary to-orange-400"
  },
  ai_advisory: {
    id: "ai_advisory",
    name: "AI Advisory",
    displayName: "AI Advisory",
    price: 199.99,
    description: "Human expertise, strategically deployed.",
    capabilities: [
      "Scheduled advisory sessions",
      "AI-prepared briefs for advisors",
      "Strategic planning & decision support",
      "Board-ready reports and summaries",
      "Growth & expansion guidance"
    ],
    limitations: [
      "No tax preparation",
      "No compliance filings",
      "Session limits apply"
    ],
    icon: "📊",
    color: "from-emerald-500 to-teal-400"
  },
  ai_tax: {
    id: "ai_tax",
    name: "AI Tax",
    displayName: "AI Tax",
    price: 149.99,
    description: "One meeting. One year. Fully prepared.",
    capabilities: [
      "AI Vault (Tax-Centered) — year-round doc organization",
      "AI Communications — prep reminders, doc requests",
      "One (1) Annual Virtual Tax Prep Meeting",
      "Human-led, AI-supported tax prep",
      "Tax document summaries & exports"
    ],
    limitations: [
      "No ongoing advisory outside annual meeting",
      "No year-round tax support",
      "State limitations may apply"
    ],
    icon: "📋",
    color: "from-amber-500 to-yellow-400"
  },
  ai_compliance: {
    id: "ai_compliance",
    name: "AI Compliance",
    displayName: "AI Compliance",
    price: 179.99,
    description: "Stay compliant without chasing deadlines.",
    capabilities: [
      "Compliance-aware AI monitoring",
      "Filing calendars & alerts",
      "Risk flags & remediation guidance",
      "Audit and reporting readiness",
      "Document input → compliance outputs"
    ],
    limitations: [
      "Industry-specific modules sold separately",
      "Does not include legal review",
      "No direct filing submissions"
    ],
    icon: "🛡️",
    color: "from-rose-500 to-red-400"
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
  const [currentTierId, setCurrentTierId] = useState<UserTierId>("ai_enterprise");
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
    const tierLevel: Record<UserTierId, number> = {
      free: 0,
      ai_assistant: 1,
      ai_operations: 2,
      ai_enterprise: 3,
      ai_advisory: 2,
      ai_tax: 2,
      ai_compliance: 2
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
      "full_automation": "ai_enterprise",
      "org_workflows": "ai_enterprise",
      "priority_support": "ai_enterprise",
      "advisory_features": "ai_advisory",
      "tax_features": "ai_tax",
      "compliance_features": "ai_compliance"
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
