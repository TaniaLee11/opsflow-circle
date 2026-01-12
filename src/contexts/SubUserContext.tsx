import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type HumanRole = "owner" | "admin" | "operator" | "user" | "client";

export type AIAgentId = 
  | "vopsy" 
  | "ai_assistant" 
  | "ai_operations" 
  | "ai_finance" 
  | "ai_compliance" 
  | "ai_marketing" 
  | "ai_education";

export interface AIAgent {
  id: AIAgentId;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  capabilities: string[];
  restrictions: string[];
  tone: string;
  enabled: boolean;
}

export interface SubUser {
  id: string;
  type: "human" | "ai";
  name: string;
  role?: HumanRole;
  agentId?: AIAgentId;
  avatar?: string;
  isActive: boolean;
}

export const AI_AGENTS: Record<AIAgentId, AIAgent> = {
  vopsy: {
    id: "vopsy",
    name: "VOPSy",
    title: "Primary Operations Intelligence",
    description: "Your central AI operations agent. Orchestrates across all domains and coordinates other AI agents.",
    icon: "⚡",
    color: "from-primary to-orange-400",
    capabilities: [
      "Full platform orchestration",
      "Cross-domain coordination",
      "Strategic recommendations",
      "Task delegation to other agents",
      "Executive summaries"
    ],
    restrictions: [],
    tone: "Confident, strategic, empowering. Acts as your virtual COO.",
    enabled: true
  },
  ai_assistant: {
    id: "ai_assistant",
    name: "AI Assistant",
    title: "General Helper",
    description: "Handles general queries, drafts communications, and provides quick answers.",
    icon: "💬",
    color: "from-blue-500 to-cyan-400",
    capabilities: [
      "Answer general questions",
      "Draft emails and messages",
      "Schedule reminders",
      "Basic research",
      "Document formatting"
    ],
    restrictions: [
      "Cannot execute financial transactions",
      "Cannot modify system settings",
      "Cannot access sensitive compliance data"
    ],
    tone: "Friendly, helpful, conversational.",
    enabled: true
  },
  ai_operations: {
    id: "ai_operations",
    name: "AI Operations",
    title: "Workflow & Process Specialist",
    description: "Manages automations, workflows, and operational efficiency.",
    icon: "⚙️",
    color: "from-purple-500 to-pink-400",
    capabilities: [
      "Create and manage automations",
      "Optimize workflows",
      "Task scheduling",
      "Process documentation",
      "Efficiency analysis"
    ],
    restrictions: [
      "Cannot send external communications",
      "Cannot modify financial data",
      "Cannot access marketing campaigns"
    ],
    tone: "Precise, systematic, efficiency-focused.",
    enabled: true
  },
  ai_finance: {
    id: "ai_finance",
    name: "AI Finance",
    title: "Financial Analyst",
    description: "Interprets financial data, provides insights, and supports financial decisions.",
    icon: "💰",
    color: "from-green-500 to-emerald-400",
    capabilities: [
      "Financial analysis and interpretation",
      "Cash flow forecasting",
      "Tax calculations and reminders",
      "Budget recommendations",
      "Expense categorization"
    ],
    restrictions: [
      "Cannot execute payments",
      "Cannot send marketing content",
      "Cannot modify operational workflows"
    ],
    tone: "Calm, precise, financially literate but accessible.",
    enabled: true
  },
  ai_compliance: {
    id: "ai_compliance",
    name: "AI Compliance",
    title: "Regulatory Specialist",
    description: "Monitors compliance requirements, deadlines, and regulatory obligations.",
    icon: "📋",
    color: "from-red-500 to-orange-400",
    capabilities: [
      "Compliance monitoring",
      "Deadline tracking",
      "Regulatory alerts",
      "Documentation requirements",
      "Risk assessment"
    ],
    restrictions: [
      "Cannot provide legal advice",
      "Cannot modify financial records",
      "Cannot send marketing communications"
    ],
    tone: "Serious, thorough, risk-aware but not alarmist.",
    enabled: true
  },
  ai_marketing: {
    id: "ai_marketing",
    name: "AI Marketing",
    title: "Marketing Strategist",
    description: "Supports marketing activities, content creation, and campaign analysis.",
    icon: "📣",
    color: "from-pink-500 to-rose-400",
    capabilities: [
      "Content suggestions",
      "Campaign performance insights",
      "Lead funnel interpretation",
      "Social media scheduling",
      "A/B test recommendations"
    ],
    restrictions: [
      "Cannot access financial data",
      "Cannot modify compliance settings",
      "Cannot execute payments"
    ],
    tone: "Creative, enthusiastic, data-informed.",
    enabled: true
  },
  ai_education: {
    id: "ai_education",
    name: "AI Education",
    title: "Learning & Development Tutor",
    description: "Guides users through courses, answers questions, and recommends learning paths.",
    icon: "🎓",
    color: "from-yellow-500 to-amber-400",
    capabilities: [
      "Course recommendations",
      "Learning path guidance",
      "Answer educational questions",
      "Progress tracking",
      "Skill gap analysis"
    ],
    restrictions: [
      "Cannot access financial data",
      "Cannot modify system settings",
      "Cannot execute operational tasks"
    ],
    tone: "Patient, encouraging, educational.",
    enabled: true
  }
};

interface SubUserContextType {
  activeActor: SubUser | null;
  availableAgents: AIAgent[];
  allAgents: AIAgent[];
  setActiveActor: (actor: SubUser) => void;
  switchToAgent: (agentId: AIAgentId) => void;
  switchToHuman: () => void;
  toggleAgentEnabled: (agentId: AIAgentId) => void;
  getAgentById: (id: AIAgentId) => AIAgent | undefined;
  canAgentPerform: (agentId: AIAgentId, action: string) => boolean;
}

const SubUserContext = createContext<SubUserContextType | undefined>(undefined);

export function SubUserProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [agents, setAgents] = useState<Record<AIAgentId, AIAgent>>(AI_AGENTS);
  const [activeActor, setActiveActorState] = useState<SubUser | null>(null);

  // Initialize with human user as default actor
  const humanActor: SubUser | null = user ? {
    id: user.id,
    type: "human",
    name: user.name,
    role: user.role as HumanRole,
    isActive: true
  } : null;

  const currentActor = activeActor || humanActor;

  const availableAgents = Object.values(agents).filter(a => a.enabled);
  const allAgents = Object.values(agents);

  const setActiveActor = (actor: SubUser) => {
    setActiveActorState(actor);
  };

  const switchToAgent = (agentId: AIAgentId) => {
    const agent = agents[agentId];
    if (agent && agent.enabled) {
      setActiveActorState({
        id: agentId,
        type: "ai",
        name: agent.name,
        agentId: agentId,
        isActive: true
      });
    }
  };

  const switchToHuman = () => {
    setActiveActorState(null);
  };

  const toggleAgentEnabled = (agentId: AIAgentId) => {
    if (!isAdmin) return;
    setAgents(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        enabled: !prev[agentId].enabled
      }
    }));
  };

  const getAgentById = (id: AIAgentId) => agents[id];

  const canAgentPerform = (agentId: AIAgentId, action: string): boolean => {
    const agent = agents[agentId];
    if (!agent) return false;
    
    // VOPSy can do everything
    if (agentId === "vopsy") return true;
    
    // Check if action is in restrictions
    const restrictedActions = agent.restrictions.map(r => r.toLowerCase());
    return !restrictedActions.some(r => r.includes(action.toLowerCase()));
  };

  return (
    <SubUserContext.Provider value={{
      activeActor: currentActor,
      availableAgents,
      allAgents,
      setActiveActor,
      switchToAgent,
      switchToHuman,
      toggleAgentEnabled,
      getAgentById,
      canAgentPerform
    }}>
      {children}
    </SubUserContext.Provider>
  );
}

export function useSubUser() {
  const context = useContext(SubUserContext);
  if (context === undefined) {
    throw new Error("useSubUser must be used within a SubUserProvider");
  }
  return context;
}
