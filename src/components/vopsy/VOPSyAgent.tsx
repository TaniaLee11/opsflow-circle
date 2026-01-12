import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  Send, 
  Mic, 
  MicOff,
  Loader2,
  ChevronDown,
  Zap,
  MessageSquare,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSubUser, AIAgentId, AI_AGENTS } from "@/contexts/SubUserContext";
import { ActorIndicator } from "@/components/subuser/ActorIndicator";

interface Message {
  id: string;
  role: "user" | "agent";
  agentId?: AIAgentId;
  content: string;
  timestamp: Date;
  actions?: { label: string; action: string }[];
}

const agentResponses: Record<AIAgentId, (input: string) => string> = {
  vopsy: (input) => {
    const lower = input.toLowerCase();
    if (lower.includes("priorit") || lower.includes("focus")) {
      return "As your operations intelligence, here's my strategic assessment:\n\n**Immediate Priority:** Quarterly tax payment due in 3 days (~$3,200)\n\n**This Week:** Follow up on overdue invoices to maintain cash flow\n\n**Strategic:** Your runway is stable but consider reducing non-essential expenses\n\nI can delegate specific tasks to our specialized agents. Want me to have AI Finance prepare a detailed tax breakdown?";
    }
    return "I'm VOPSy, your primary operations intelligence. I orchestrate across all domains and can coordinate our specialized AI agents for specific tasks. What would you like to accomplish?";
  },
  ai_assistant: (input) => {
    return "I'm here to help with general tasks! I can draft emails, answer questions, and assist with everyday work. What can I help you with?";
  },
  ai_operations: (input) => {
    return "As your Operations specialist, I focus on workflows and automation. I can help you:\n\n• Set up automated processes\n• Optimize existing workflows\n• Document procedures\n• Schedule recurring tasks\n\nWhat operational challenge are you facing?";
  },
  ai_finance: (input) => {
    const lower = input.toLowerCase();
    if (lower.includes("tax") || lower.includes("taxes")) {
      return "Based on your financial data:\n\n**Q4 Estimated Tax:** $3,200\n**Calculation:**\n• YTD Profit: ~$42,500\n• Estimated Rate: 30%\n• Q4 Portion: $3,200\n\n**Recommendation:** Set aside this amount by January 15. I can help you track this or set up automatic set-asides.\n\n⚠️ *Note: I provide calculations but cannot give tax advice. Consult a professional for specific guidance.*";
    }
    if (lower.includes("cash") || lower.includes("money") || lower.includes("flow")) {
      return "Here's your cash flow analysis:\n\n**Current Position:**\n• Cash on Hand: $24,580\n• Monthly Burn Rate: $8,200 (↓5% from last month)\n• Runway: ~3 months\n\n**Assessment:** You're in a stable position. The reduced burn rate is positive.\n\n**Watch Items:**\n• ABC Corp invoice is overdue ($5,000)\n• Quarterly taxes due soon ($3,200)";
    }
    return "I'm AI Finance, specializing in financial analysis and interpretation. I can help you understand:\n\n• Cash flow and runway\n• Tax obligations and set-asides\n• Expense patterns\n• Budget recommendations\n\nWhat financial question do you have?";
  },
  ai_compliance: (input) => {
    return "I'm AI Compliance, monitoring your regulatory obligations.\n\n**Current Alerts:**\n🔴 Quarterly Tax Payment: Due January 15 (3 days)\n🟡 Annual Report Filing: Due in 45 days\n\n**Upcoming:**\n• Business License Renewal: March 1\n• Insurance Review: February 15\n\nI track deadlines and requirements but cannot provide legal advice.";
  },
  ai_marketing: (input) => {
    return "I'm AI Marketing, here to support your growth efforts!\n\n**Quick Insights:**\n• Email open rate: 24% (above industry avg)\n• Top performing content: How-to guides\n• Lead quality score: 7.2/10\n\nI can help with content ideas, campaign analysis, and audience insights. What marketing challenge are you working on?";
  },
  ai_education: (input) => {
    return "Welcome to your learning journey! 🎓\n\nBased on your recent activity, I recommend:\n\n**Priority Course:**\n📚 \"Understanding Cash Flow\" (45 min)\n*Triggered by: Recent cash flow questions*\n\n**Learning Path:**\n1. Cash Flow Basics\n2. Tax Planning for Business\n3. Building Business Credit\n\nShall I start the recommended course or show your full learning path?";
  }
};

export function VOPSyAgent() {
  const { user } = useAuth();
  const { activeActor, availableAgents, switchToAgent } = useSubUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<AIAgentId>("vopsy");
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  
  const currentAgent = AI_AGENTS[selectedAgentId];
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      agentId: "vopsy",
      content: `Hey ${user?.name?.split(" ")[0] || "there"}! I'm VOPSy, your operations intelligence. I can help you understand your business, complete tasks, and make decisions. You can also switch to our specialized agents for domain-specific help.`,
      timestamp: new Date(),
      actions: [
        { label: "Review finances", action: "review_finances" },
        { label: "Check priorities", action: "check_priorities" }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleAgentSwitch = (agentId: AIAgentId) => {
    setSelectedAgentId(agentId);
    setShowAgentPicker(false);
    
    const agent = AI_AGENTS[agentId];
    const switchMessage: Message = {
      id: crypto.randomUUID(),
      role: "agent",
      agentId: agentId,
      content: `You're now speaking with **${agent.name}** — ${agent.title}.\n\n${agent.description}\n\nHow can I help you?`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, switchMessage]);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1200));

    const responseFunc = agentResponses[selectedAgentId];
    const agentResponse: Message = {
      id: crypto.randomUUID(),
      role: "agent",
      agentId: selectedAgentId,
      content: responseFunc(messageText),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, agentResponse]);
    setIsTyping(false);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center glow-primary animate-pulse-glow"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[420px] rounded-2xl overflow-hidden shadow-2xl border border-border",
          "bg-card backdrop-blur-xl",
          isMinimized ? "h-16" : "h-[36rem]"
        )}
      >
        {/* Header with Agent Selector */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/20 to-primary/5 border-b border-border">
          <div className="relative">
            <button
              onClick={() => setShowAgentPicker(!showAgentPicker)}
              className="flex items-center gap-3 hover:bg-muted/50 px-2 py-1 rounded-lg transition-colors"
            >
              <div className={cn(
                "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                currentAgent.color
              )}>
                <span className="text-sm">{currentAgent.icon}</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-foreground text-sm">{currentAgent.name}</h3>
                  <ChevronDown className={cn(
                    "w-3 h-3 text-muted-foreground transition-transform",
                    showAgentPicker && "rotate-180"
                  )} />
                </div>
                <p className="text-xs text-muted-foreground">{currentAgent.title}</p>
              </div>
            </button>

            {/* Agent Picker Dropdown */}
            <AnimatePresence>
              {showAgentPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 top-full mt-2 w-64 rounded-xl bg-card border border-border shadow-xl z-10 p-2"
                >
                  {availableAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentSwitch(agent.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors mb-1",
                        selectedAgentId === agent.id ? "bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                        agent.color
                      )}>
                        <span className="text-sm">{agent.icon}</span>
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-foreground text-sm">{agent.name}</span>
                        <p className="text-xs text-muted-foreground">{agent.title}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 h-[26rem] overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const messageAgent = message.agentId ? AI_AGENTS[message.agentId] : null;
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" && "flex-row-reverse"
                    )}
                  >
                    {message.role === "agent" && messageAgent && (
                      <div className={cn(
                        "w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                        messageAgent.color
                      )}>
                        <span className="text-xs">{messageAgent.icon}</span>
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[85%] rounded-xl px-4 py-3",
                      message.role === "agent" 
                        ? "bg-muted text-foreground" 
                        : "bg-primary text-primary-foreground"
                    )}>
                      {message.role === "agent" && messageAgent && (
                        <p className="text-[10px] text-muted-foreground mb-1 font-medium">
                          {messageAgent.name}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.actions && message.role === "agent" && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.actions.map((action) => (
                            <button
                              key={action.action}
                              onClick={() => handleSend(action.label)}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center",
                    currentAgent.color
                  )}>
                    <span className="text-xs">{currentAgent.icon}</span>
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">{currentAgent.name} is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-muted border border-border">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Ask ${currentAgent.name}...`}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none px-2"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
