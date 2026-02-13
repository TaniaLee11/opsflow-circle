import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

// ============================================
// USER IDENTITY TYPE (Language/Tone Only)
// ============================================
// Controls: Language, Tone, Examples, Scenarios, Marketing alignment
// Does NOT control: Access, Permissions, Tools, Services
export type UserIdentityType = "consultant" | "contractor" | "nonprofit_leader";

export const USER_IDENTITY_LABELS: Record<UserIdentityType, string> = {
  consultant: "Consultant",
  contractor: "Contractor",
  nonprofit_leader: "Nonprofit Leader"
};

// ============================================
// USER TIER TYPE (Access & Permissions)
// ============================================
// Controls: Platform permissions, Feature access, LMS access, Service eligibility, AI behavior boundaries
// ALWAYS overrides User Identity Type
export type UserTierId = 
  | "free" 
  | "ai_assistant" 
  | "ai_operations" 
  | "ai_enterprise" 
  | "ai_advisory" 
  | "ai_tax" 
  | "ai_compliance"
  | "cohort";

// LMS Access Levels
export type LmsAccessLevel = 
  | "free_lms"           // AI Free: Free LMS only
  | "free_lms_guided"    // AI Assistant: Free LMS + guided content
  | "full_operations"    // AI Operations, AI Advisory: Full Operations LMS
  | "free_lms_tax"       // AI Tax: Free LMS + tax micro-courses
  | "full_academy";      // AI Enterprise, AI Compliance: Full Academy

// Environment types
export type EnvironmentType = "production" | "cohort";

export interface UserTier {
  id: UserTierId;
  name: string;
  displayName: string;
  price: number | null;
  priceLabel?: string;
  description: string;
  whoItsFor: string;
  capabilities: string[];
  limitations: string[];
  icon: string;
  color: string;
  // LMS Access
  lmsAccess: LmsAccessLevel;
  // Service Inclusion Flags
  includesHumanServices: boolean;
  includesTaxPrep: boolean;
  includesAdvisory: boolean;
  isAddon?: boolean; // Can be added to other tiers (e.g., AI Tax)
}

export const USER_TIERS: Record<UserTierId, UserTier> = {
  // 🟢 AI FREE — Education & Awareness Only
  free: {
    id: "free",
    name: "Free",
    displayName: "AI Free",
    price: null,
    description: "VOPSy the Educator — Learn concepts and best practices",
    whoItsFor: "Consultants, contractors, and nonprofit leaders who want to learn business operations without automation or integrations.",
    capabilities: [
      "VOPSy recommends courses from Academy",
      "Educational content and learning paths",
      "Answers questions using course content",
      "Explains business concepts (P&L, cash flow, etc.)",
      "AI Vault — upload & store documents",
      "Business Plan Builder (DIY with AI prompts)"
    ],
    limitations: [
      "Cannot connect integrations",
      "Cannot access your business data",
      "Cannot take actions on your behalf",
      "Education only — you do the work"
    ],
    icon: "🟢",
    color: "from-gray-500 to-gray-400",
    lmsAccess: "free_lms",
    includesHumanServices: false,
    includesTaxPrep: false,
    includesAdvisory: false
  },

  // 🔵 AI ASSISTANT — Guided Execution
  ai_assistant: {
    id: "ai_assistant",
    name: "AI Assistant",
    displayName: "AI Assistant",
    price: 34.99,
    description: "VOPSy the Connector — Connect your tools and see your data",
    whoItsFor: "Consultants and contractors who want to see all their business data in one place with AI insights.",
    capabilities: [
      "Everything in AI Free, PLUS:",
      "Connect unlimited integrations (Gmail, QuickBooks, Stripe, etc.)",
      "VOPSy reads your data (emails, transactions, reports)",
      "Summarizes emails and prioritizes inbox",
      "Shows financial data (P&L, cash flow, expenses)",
      "Analyzes and provides insights",
      "Monitors integration health",
      "Recommends actions based on your data",
      "Smart reminders and deadline tracking"
    ],
    limitations: [
      "Read-only access to data",
      "VOPSy cannot send emails for you",
      "VOPSy cannot create campaigns or transactions",
      "You still do the work — VOPSy shows you what needs done"
    ],
    icon: "🔵",
    color: "from-blue-500 to-cyan-400",
    lmsAccess: "free_lms_guided",
    includesHumanServices: false,
    includesTaxPrep: false,
    includesAdvisory: false
  },

  // 🟣 AI OPERATIONS — Systemized Business
  ai_operations: {
    id: "ai_operations",
    name: "AI Operations",
    displayName: "AI Operations",
    price: 99.99,
    description: "VOPSy the Doer — AI that does the work for you",
    whoItsFor: "Founders and owners who want AI to handle routine tasks and execute workflows automatically.",
    capabilities: [
      "Everything in AI Assistant, PLUS:",
      "VOPSy sends emails on your behalf",
      "Creates and schedules email campaigns (Mailchimp)",
      "Categorizes transactions in QuickBooks",
      "Builds spreadsheets on Google Drive",
      "Schedules meetings via Calendly",
      "Drafts and processes invoices",
      "Executes multi-step workflows",
      "Automates routine tasks (billing, reminders, reporting)",
      "Full read/write access to connected tools"
    ],
    limitations: [
      "No human services included (add AI Advisory for that)",
      "Actions require confirmation for sensitive operations",
      "Single-entity focus (upgrade to AI Enterprise for multi-entity)"
    ],
    icon: "🟣",
    color: "from-purple-500 to-pink-400",
    lmsAccess: "full_operations",
    includesHumanServices: false,
    includesTaxPrep: false,
    includesAdvisory: false
  },

  // 🟠 AI TAX — Human-Prepared, Tech-Enabled
  ai_tax: {
    id: "ai_tax",
    name: "AI Tax",
    displayName: "AI Tax",
    price: null,
    priceLabel: "From $125",
    description: "Human-Prepared, Tech-Enabled",
    whoItsFor: "Clients who want annual tax preparation, not year-round engagement.",
    capabilities: [
      "Human-prepared tax returns",
      "Live online tax interviews (Zoom or equivalent)",
      "Annual tax preparation",
      "Quarterly estimates (if applicable)",
      "AI-supported organization and document prep",
      "Income tax and sales tax accrual visibility",
      "Light compliance awareness (directional, not enforcement)",
      "Deadline reminders",
      "Tax-specific LMS micro-courses",
      "Inherits AI Free LMS access"
    ],
    limitations: [
      "NOT DIY filing",
      "NOT Client-prepared with review",
      "NOT Software-only",
      "No ongoing advisory outside annual meeting",
      "State limitations may apply"
    ],
    icon: "🟠",
    color: "from-amber-500 to-yellow-400",
    lmsAccess: "free_lms_tax",
    includesHumanServices: true,
    includesTaxPrep: true,
    includesAdvisory: false,
    isAddon: true // Can be added to AI Free, AI Assistant, or AI Operations
  },

  // 🔴 AI ADVISORY — Platform + Human Engagement
  ai_advisory: {
    id: "ai_advisory",
    name: "AI Advisory",
    displayName: "AI Advisory",
    price: null,
    priceLabel: "From $125/hr",
    description: "Platform + Human Engagement",
    whoItsFor: "Founders and owners who want strategic guidance beyond self-service.",
    capabilities: [
      "Same platform access as AI Operations",
      "Same workflows, automation, dashboards",
      "Full Operations LMS",
      "Human advisory services included",
      "One-time projects or monthly ongoing advisory",
      "Strategic direction",
      "Financial interpretation",
      "Capital readiness guidance",
      "Accountability",
      "Advisors work inside the platform with the client",
      "AI supports preparation and follow-up"
    ],
    limitations: [
      "Platform usage is required",
      "AI never replaces human judgment",
      "No tax preparation included",
      "No compliance filings included",
      "Session limits may apply"
    ],
    icon: "🔴",
    color: "from-emerald-500 to-teal-400",
    lmsAccess: "full_operations",
    includesHumanServices: true,
    includesTaxPrep: false,
    includesAdvisory: true
  },

  // 🔴 AI ENTERPRISE — Full-Scope Partnership
  ai_enterprise: {
    id: "ai_enterprise",
    name: "AI Enterprise",
    displayName: "AI Enterprise",
    price: 499,
    description: "Full-Scope Partnership",
    whoItsFor: "Multi-entity, growth, or complex organizations needing long-term strategic engagement.",
    capabilities: [
      "Full platform access (all tools + LMS)",
      "Ongoing, high-touch human partnership",
      "Cross-functional coordination: Operations, Tax, Advisory, Compliance",
      "Multi-entity support",
      "Multi-user access & permissions",
      "Advanced analytics & reporting",
      "Governance & audit trails",
      "Enterprise-grade integrations & security",
      "Priority support",
      "Full Academy access"
    ],
    limitations: [
      "Annual commitment required",
      "Custom onboarding process"
    ],
    icon: "🔴",
    color: "from-primary to-orange-400",
    lmsAccess: "full_academy",
    includesHumanServices: true,
    includesTaxPrep: true,
    includesAdvisory: true
  },

  // ⚫ AI COMPLIANCE — Governance & Oversight
  ai_compliance: {
    id: "ai_compliance",
    name: "AI Compliance",
    displayName: "AI Compliance",
    price: null,
    priceLabel: "From $175",
    description: "Governance & Oversight",
    whoItsFor: "Owners and organizations operating in regulated or grant-funded environments. Typically for nonprofits and regulated entities.",
    capabilities: [
      "Quarterly compliance reviews",
      "Annual tax filings (e.g., 990)",
      "Governance tracking",
      "Reporting and deadlines",
      "Board-level support",
      "Full Academy access",
      "Compliance training",
      "AI assists with monitoring and education"
    ],
    limitations: [
      "Humans are responsible for review, guidance, and filing",
      "Industry-specific modules sold separately",
      "Does not include legal review"
    ],
    icon: "⚫",
    color: "from-rose-500 to-red-400",
    lmsAccess: "full_academy",
    includesHumanServices: true,
    includesTaxPrep: true, // Annual 990 filings
    includesAdvisory: false
  },

  // 🟠 AI COHORT — Invite-Only Members
  cohort: {
    id: "cohort",
    name: "Cohort",
    displayName: "AI Cohort",
    price: null,
    priceLabel: "Invite Only",
    description: "Exclusive 60-day AI transformation program",
    whoItsFor: "Invited members participating in the AI cohort program",
    capabilities: [
      "Full platform access",
      "AI-powered operations tools",
      "Academy training resources",
      "Financial intelligence hub",
      "Workflow automation"
    ],
    limitations: [
      "Time-limited access (60 days)",
      "Invitation required"
    ],
    icon: "🟠",
    color: "from-orange-500 to-amber-400",
    lmsAccess: "full_academy",
    includesHumanServices: false,
    includesTaxPrep: false,
    includesAdvisory: false
  }
};

// LMS Access descriptions for UI
export const LMS_ACCESS_DESCRIPTIONS: Record<LmsAccessLevel, { label: string; description: string }> = {
  free_lms: {
    label: "Free LMS",
    description: "Business basics & planning education"
  },
  free_lms_guided: {
    label: "Free LMS + Guided Content",
    description: "Role- and stage-based learning with AI guidance"
  },
  full_operations: {
    label: "Full Operations LMS",
    description: "Complete operational training and workflows"
  },
  free_lms_tax: {
    label: "Free LMS + Tax Courses",
    description: "Business basics plus tax-specific micro-courses"
  },
  full_academy: {
    label: "Full Academy",
    description: "Complete access to all courses and training"
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
  clientOrganizations?: string[];
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
  
  // User Identity (for language/tone)
  userIdentity: UserIdentityType;
  setUserIdentity: (identity: UserIdentityType) => void;
  
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
  canAccessLmsContent: (requiredLevel: LmsAccessLevel) => boolean;
  getTierById: (id: UserTierId) => UserTier | undefined;
  
  // Service checks
  hasHumanServices: () => boolean;
  hasTaxPrep: () => boolean;
  hasAdvisory: () => boolean;
  
  // Cohort actions
  exitCohort: (downgradeToTier: UserTierId | "exit") => void;
}

const UserTierContext = createContext<UserTierContextType | undefined>(undefined);

export function UserTierProvider({ children }: { children: ReactNode }) {
  const { user, isOwner } = useAuth();
  
  // User's tier
  const [currentTierId, setCurrentTierId] = useState<UserTierId>("ai_operations");
  const [environment, setEnvironment] = useState<EnvironmentType>("cohort");
  
  // User Identity Type (language/tone only)
  const [userIdentity, setUserIdentity] = useState<UserIdentityType>("consultant");
  
  const [cohortConfig, setCohortConfig] = useState<CohortConfig | null>({
    isActive: true,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    inviteCode: "COHORT-DEMO2024"
  });
  
  const [enterpriseConfig, setEnterpriseConfig] = useState<EnterpriseConfig | null>(null);

  const currentTier = USER_TIERS[currentTierId];
  const isCohort = environment === "cohort";
  const isEnterpriseEnabled = enterpriseConfig?.enabled ?? false;
  const allTiers = Object.values(USER_TIERS);

  const setTier = (tierId: UserTierId) => {
    setCurrentTierId(tierId);
  };

  // LMS Access level hierarchy
  const lmsAccessHierarchy: Record<LmsAccessLevel, number> = {
    free_lms: 0,
    free_lms_guided: 1,
    free_lms_tax: 1, // Same level as guided, different content
    full_operations: 2,
    full_academy: 3
  };

  const canAccessLmsContent = (requiredLevel: LmsAccessLevel): boolean => {
    const userLevel = lmsAccessHierarchy[currentTier.lmsAccess];
    const requiredLevelValue = lmsAccessHierarchy[requiredLevel];
    
    // Special case: tax courses available to free_lms_tax holders
    if (requiredLevel === "free_lms_tax" && currentTier.lmsAccess === "free_lms_tax") {
      return true;
    }
    
    return userLevel >= requiredLevelValue;
  };

  const canAccessFeature = (feature: string): boolean => {
    const tierLevel: Record<UserTierId, number> = {
      free: 0,
      ai_assistant: 1,
      ai_operations: 2,
      ai_enterprise: 4,
      ai_advisory: 3, // Same platform as Operations + human services
      ai_tax: 1,      // Free tier + human tax services
      ai_compliance: 3 // Full academy + human services
    };
    
    const featureRequirements: Record<string, UserTierId> = {
      // Core features
      "ai_interaction": "free",
      "lms_preview": "free",
      "vault_basic": "free",
      "communications_basic": "free",
      
      // Assistant level
      "business_plans": "ai_assistant",
      "pitch_decks": "ai_assistant",
      "compliance_checklists": "ai_assistant",
      "templates": "ai_assistant",
      "lms_guided": "ai_assistant",
      "guided_execution": "ai_assistant",
      "vault_expanded": "ai_assistant",
      
      // Operations level
      "multi_step_workflows": "ai_operations",
      "automation_execution": "ai_operations",
      "operational_dashboards": "ai_operations",
      "tool_integrations": "ai_operations",
      "lms_full_operations": "ai_operations",
      
      // Advisory level
      "advisory_features": "ai_advisory",
      "human_advisory": "ai_advisory",
      "strategic_planning": "ai_advisory",
      
      // Enterprise level
      "full_automation": "ai_enterprise",
      "org_workflows": "ai_enterprise",
      "priority_support": "ai_enterprise",
      "multi_entity": "ai_enterprise",
      "multi_user": "ai_enterprise",
      "lms_full_academy": "ai_enterprise",
      
      // Specialized
      "tax_features": "ai_tax",
      "human_tax_prep": "ai_tax",
      "compliance_features": "ai_compliance",
      "governance_tracking": "ai_compliance"
    };
    
    const requiredTier = featureRequirements[feature] || "free";
    return tierLevel[currentTierId] >= tierLevel[requiredTier];
  };

  const getTierById = (id: UserTierId) => USER_TIERS[id];

  // Service inclusion checks
  const hasHumanServices = () => currentTier.includesHumanServices;
  const hasTaxPrep = () => currentTier.includesTaxPrep;
  const hasAdvisory = () => currentTier.includesAdvisory;

  const exitCohort = (downgradeToTier: UserTierId | "exit") => {
    if (downgradeToTier === "exit") {
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
      userIdentity,
      setUserIdentity,
      environment,
      isCohort,
      cohortConfig,
      enterpriseConfig,
      isEnterpriseEnabled,
      allTiers,
      setTier,
      canAccessFeature,
      canAccessLmsContent,
      getTierById,
      hasHumanServices,
      hasTaxPrep,
      hasAdvisory,
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
