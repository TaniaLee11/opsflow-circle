import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  Send, 
  Loader2,
  MessageSquare,
  Upload,
  Paperclip
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTier } from "@/contexts/UserTierContext";

interface Message {
  id: string;
  role: "user" | "vopsy";
  content: string;
  timestamp: Date;
  actions?: { label: string; action: string }[];
}

// VOPSy is ONE agent with FULL capabilities across all domains
// Tiers affect what features users can access, not VOPSy's abilities
const generateVOPSyResponse = (input: string, tierCapabilities: string[]): string => {
  const lower = input.toLowerCase();
  
  // Financial queries
  if (lower.includes("tax") || lower.includes("taxes")) {
    return "**VOPSy — Tax Analysis**\n\nBased on your financial data:\n\n**Q4 Estimated Tax:** $3,200\n\n**Calculation:**\n• YTD Profit: ~$42,500\n• Estimated Rate: 30%\n• Q4 Portion: $3,200\n\n**Recommendation:** Set aside this amount by January 15.\n\n⚠️ *Note: This is an estimate. Consult a tax professional for official advice.*";
  }
  
  if (lower.includes("cash") || lower.includes("flow") || lower.includes("runway")) {
    return "**VOPSy — Cash Flow Analysis**\n\n**Current Position:**\n• Cash on Hand: $24,580\n• Monthly Burn Rate: $8,200 (↓5% from last month)\n• Runway: ~3 months\n\n**Assessment:** You're in a stable position. The reduced burn rate is positive.\n\n**Watch Items:**\n• ABC Corp invoice is overdue ($5,000)\n• Quarterly taxes due soon ($3,200)";
  }

  // Operations queries
  if (lower.includes("automat") || lower.includes("workflow")) {
    if (tierCapabilities.includes("automation_execution")) {
      return "**VOPSy — Automation Setup**\n\nI can help you create and execute automations.\n\n**Recommendation:**\n1. Identify the repetitive task\n2. Define trigger conditions\n3. Map the process steps\n4. Set approval checkpoints\n\nI'll prepare the automation for your approval before executing. What task would you like to automate?";
    }
    return "**VOPSy — Workflow Guidance**\n\nI can help you plan workflows! However, executing automations requires the **AI Operations** tier.\n\nIn the meantime, I can:\n• Document your current process\n• Identify automation opportunities\n• Create step-by-step guides\n\nWould you like me to help plan a workflow?";
  }

  // Strategic queries
  if (lower.includes("priorit") || lower.includes("focus") || lower.includes("strategic")) {
    return "**VOPSy — Strategic Assessment**\n\nLooking across your operations:\n\n🔴 **Immediate Priority:** Quarterly tax payment due in 3 days (~$3,200)\n\n🟡 **This Week:** Follow up on overdue invoices to maintain cash flow\n\n🟢 **Strategic Initiative:** Your runway is stable — consider growth investments\n\n**Cross-Domain View:**\n• Finance: Tax prep urgent\n• Marketing: Campaign performing +24% above benchmark\n• Operations: 3 workflows ready for optimization\n\nWhat area would you like me to focus on?";
  }

  // Marketing queries
  if (lower.includes("marketing") || lower.includes("campaign") || lower.includes("content")) {
    return "**VOPSy — Marketing Insights**\n\n**Quick Stats:**\n• Email open rate: 24% (above industry avg)\n• Top performing content: How-to guides\n• Lead quality score: 7.2/10\n\nI can help with content ideas, campaign analysis, and audience insights. What marketing challenge are you working on?";
  }

  // Compliance queries
  if (lower.includes("compliance") || lower.includes("regulatory") || lower.includes("deadline")) {
    return "**VOPSy — Compliance Check**\n\n**Upcoming Deadlines:**\n• Q4 Tax Filing: 15 days\n• Annual Report: 45 days\n• Business License Renewal: 90 days\n\n**Status:**\n✅ Current on all regulatory requirements\n⚠️ Tax payment approaching\n\nNeed me to set reminders or prepare documentation?";
  }

  // Learning queries
  if (lower.includes("learn") || lower.includes("course") || lower.includes("training")) {
    return "**VOPSy — Learning Path** 🎓\n\nBased on your recent activity, I recommend:\n\n**Priority Course:**\n📚 \"Understanding Cash Flow\" (45 min)\n*Triggered by: Recent cash flow questions*\n\n**Learning Path:**\n1. Cash Flow Basics\n2. Tax Planning for Business\n3. Building Business Credit\n\nShall I start the recommended course or show your full learning path?";
  }

  // Default response
  return "**VOPSy — Ready to Help**\n\nI'm your virtual operations intelligence — one agent covering all business domains:\n\n• **Finance** — Cash flow, taxes, budgeting\n• **Operations** — Workflows, automations, SOPs\n• **Marketing** — Campaigns, content, analytics\n• **Compliance** — Deadlines, regulations, documentation\n• **Education** — Courses, learning paths, skill development\n\nWhat would you like to work on?";
};

export function VOPSyAgent() {
  const { user } = useAuth();
  const { currentTier, canAccessFeature } = useUserTier();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "vopsy",
      content: `Hey ${user?.name?.split(" ")[0] || "there"}! I'm VOPSy — your Virtual OPS Intelligence.\n\nI'm your single AI agent covering **all business operations**: finance, compliance, marketing, operations, and education. No need to switch modes — just ask me anything.\n\nYou're on the **${currentTier.displayName}** plan.`,
      timestamp: new Date(),
      actions: [
        { label: "Review my cash flow", action: "Show me my current cash flow and runway" },
        { label: "What should I focus on?", action: "What are my strategic priorities this week?" }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

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

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Get tier capabilities for context-aware responses
    const tierCapabilities = currentTier.capabilities;
    
    const vopsyResponse: Message = {
      id: crypto.randomUUID(),
      role: "vopsy",
      content: generateVOPSyResponse(messageText, tierCapabilities),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, vopsyResponse]);
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
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/20 to-primary/5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">VOPSy</h3>
              <p className="text-xs text-muted-foreground">Virtual OPS Intelligence</p>
            </div>
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
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  {message.role === "vopsy" && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-xl px-4 py-3",
                    message.role === "vopsy" 
                      ? "bg-muted text-foreground" 
                      : "bg-primary text-primary-foreground"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.actions && message.role === "vopsy" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {message.actions.map((action) => (
                          <button
                            key={action.action}
                            onClick={() => handleSend(action.action)}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">VOPSy is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-muted border border-border">
                <button className="p-1.5 rounded-lg hover:bg-background/50 transition-colors text-muted-foreground hover:text-foreground">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask VOPSy anything..."
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
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                VOPSy covers all business domains • {currentTier.displayName}
              </p>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
