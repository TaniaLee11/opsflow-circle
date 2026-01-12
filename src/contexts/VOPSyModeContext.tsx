import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type VOPSyModeId = 
  | "assistant"
  | "operations"
  | "enterprise"
  | "finance"
  | "marketing"
  | "education";

export type RiskLevel = "low" | "medium" | "high";

export interface VOPSyMode {
  id: VOPSyModeId;
  name: string;
  fullName: string;
  purpose: string;
  riskLevel: RiskLevel;
  icon: string;
  color: string;
  capabilities: string[];
  limitations: string[];
  tone: string;
  requiresAdmin: boolean;
  enabled: boolean;
}

export const VOPSY_MODES: Record<VOPSyModeId, VOPSyMode> = {
  assistant: {
    id: "assistant",
    name: "Assistant",
    fullName: "VOPSy (Assistant Mode)",
    purpose: "Help, explain, draft",
    riskLevel: "low",
    icon: "💬",
    color: "from-blue-500 to-cyan-400",
    capabilities: [
      "Answer questions",
      "Explain data and insights",
      "Draft emails, notes, summaries",
      "Basic research and lookup",
      "Schedule reminders"
    ],
    limitations: [
      "No execution of tasks",
      "No system changes",
      "Cannot trigger automations"
    ],
    tone: "Friendly, helpful, conversational. Makes complex information accessible.",
    requiresAdmin: false,
    enabled: true
  },
  operations: {
    id: "operations",
    name: "Operations",
    fullName: "VOPSy (Operations Mode)",
    purpose: "Run the business day-to-day",
    riskLevel: "medium",
    icon: "⚙️",
    color: "from-purple-500 to-pink-400",
    capabilities: [
      "Recommend workflows",
      "Set up automations (with approval)",
      "Guide processes step-by-step",
      "Draft SOPs and procedures",
      "Prepare actions for confirmation"
    ],
    limitations: [
      "Requires confirmation for execution",
      "Cannot execute without approval",
      "High-risk actions need Enterprise mode"
    ],
    tone: "Precise, systematic, efficiency-focused. Guides you through processes.",
    requiresAdmin: false,
    enabled: true
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    fullName: "VOPSy (Enterprise Mode)",
    purpose: "Strategic + cross-system orchestration",
    riskLevel: "high",
    icon: "🏢",
    color: "from-primary to-orange-400",
    capabilities: [
      "Cross-platform insights",
      "Multi-department logic",
      "Scenario planning",
      "Delegate between modes",
      "Prepare high-impact actions",
      "Strategic recommendations"
    ],
    limitations: [
      "Owner/Admin only",
      "Actions still require final approval",
      "Cannot bypass security controls"
    ],
    tone: "Strategic, executive-level, decisive. Acts as your virtual COO.",
    requiresAdmin: true,
    enabled: true
  },
  finance: {
    id: "finance",
    name: "Finance",
    fullName: "VOPSy (Finance Mode)",
    purpose: "Financial analysis and guidance",
    riskLevel: "medium",
    icon: "💰",
    color: "from-green-500 to-emerald-400",
    capabilities: [
      "Financial analysis and interpretation",
      "Cash flow forecasting",
      "Tax calculations and reminders",
      "Budget recommendations",
      "Expense categorization"
    ],
    limitations: [
      "Cannot execute payments",
      "Cannot provide official tax advice",
      "Calculations are estimates only"
    ],
    tone: "Calm, precise, financially literate but accessible.",
    requiresAdmin: false,
    enabled: true
  },
  marketing: {
    id: "marketing",
    name: "Marketing",
    fullName: "VOPSy (Marketing Mode)",
    purpose: "Marketing strategy and content",
    riskLevel: "low",
    icon: "📣",
    color: "from-pink-500 to-rose-400",
    capabilities: [
      "Content suggestions and drafts",
      "Campaign performance insights",
      "Lead funnel interpretation",
      "Social media scheduling ideas",
      "A/B test recommendations"
    ],
    limitations: [
      "Cannot access financial data",
      "Cannot send campaigns without approval",
      "Analytics are interpretive"
    ],
    tone: "Creative, enthusiastic, data-informed.",
    requiresAdmin: false,
    enabled: true
  },
  education: {
    id: "education",
    name: "Education",
    fullName: "VOPSy (Education Mode)",
    purpose: "Learning and skill development",
    riskLevel: "low",
    icon: "🎓",
    color: "from-yellow-500 to-amber-400",
    capabilities: [
      "Course recommendations",
      "Learning path guidance",
      "Answer educational questions",
      "Progress tracking",
      "Skill gap analysis"
    ],
    limitations: [
      "Cannot modify system settings",
      "Cannot access sensitive business data",
      "Recommendations are advisory"
    ],
    tone: "Patient, encouraging, educational. Like a supportive tutor.",
    requiresAdmin: false,
    enabled: true
  }
};

interface VOPSyModeContextType {
  currentMode: VOPSyMode;
  availableModes: VOPSyMode[];
  allModes: VOPSyMode[];
  switchMode: (modeId: VOPSyModeId) => void;
  toggleModeEnabled: (modeId: VOPSyModeId) => void;
  getModeById: (id: VOPSyModeId) => VOPSyMode | undefined;
  canAccessMode: (modeId: VOPSyModeId) => boolean;
}

const VOPSyModeContext = createContext<VOPSyModeContextType | undefined>(undefined);

export function VOPSyModeProvider({ children }: { children: ReactNode }) {
  const { isAdmin, isOwner } = useAuth();
  const [modes, setModes] = useState<Record<VOPSyModeId, VOPSyMode>>(VOPSY_MODES);
  const [currentModeId, setCurrentModeId] = useState<VOPSyModeId>("assistant");

  const canAccessMode = (modeId: VOPSyModeId): boolean => {
    const mode = modes[modeId];
    if (!mode || !mode.enabled) return false;
    if (mode.requiresAdmin && !isAdmin && !isOwner) return false;
    return true;
  };

  const availableModes = Object.values(modes).filter(m => canAccessMode(m.id));
  const allModes = Object.values(modes);
  const currentMode = modes[currentModeId];

  const switchMode = (modeId: VOPSyModeId) => {
    if (canAccessMode(modeId)) {
      setCurrentModeId(modeId);
    }
  };

  const toggleModeEnabled = (modeId: VOPSyModeId) => {
    if (!isAdmin && !isOwner) return;
    // Enterprise mode cannot be disabled by non-owners
    if (modeId === "enterprise" && !isOwner) return;
    
    setModes(prev => ({
      ...prev,
      [modeId]: {
        ...prev[modeId],
        enabled: !prev[modeId].enabled
      }
    }));
  };

  const getModeById = (id: VOPSyModeId) => modes[id];

  return (
    <VOPSyModeContext.Provider value={{
      currentMode,
      availableModes,
      allModes,
      switchMode,
      toggleModeEnabled,
      getModeById,
      canAccessMode
    }}>
      {children}
    </VOPSyModeContext.Provider>
  );
}

export function useVOPSyMode() {
  const context = useContext(VOPSyModeContext);
  if (context === undefined) {
    throw new Error("useVOPSyMode must be used within a VOPSyModeProvider");
  }
  return context;
}
