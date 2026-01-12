import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  Send, 
  Loader2,
  ChevronDown,
  MessageSquare,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useVOPSyMode, VOPSyModeId, VOPSY_MODES } from "@/contexts/VOPSyModeContext";

interface Message {
  id: string;
  role: "user" | "vopsy";
  modeId?: VOPSyModeId;
  content: string;
  timestamp: Date;
  actions?: { label: string; action: string }[];
}

const modeResponses: Record<VOPSyModeId, (input: string) => string> = {
  assistant: (input) => {
    return "I'm here to help! In Assistant mode, I can answer questions, explain data, and draft communications for you. What would you like to know?";
  },
  operations: (input) => {
    const lower = input.toLowerCase();
    if (lower.includes("automat") || lower.includes("workflow")) {
      return "In Operations mode, I can help you set up workflows and automations.\n\n**Recommendation:**\n1. Identify the repetitive task\n2. Define trigger conditions\n3. Map the process steps\n4. Set approval checkpoints\n\nWant me to guide you through setting up a specific automation? I'll prepare it for your approval before executing.";
    }
    return "I'm in Operations mode — focused on running your business day-to-day.\n\nI can help you:\n• Set up automations (with your approval)\n• Optimize existing workflows\n• Guide you through processes\n• Draft SOPs and procedures\n\nWhat operational challenge are you facing?";
  },
  enterprise: (input) => {
    const lower = input.toLowerCase();
    if (lower.includes("priorit") || lower.includes("focus") || lower.includes("strategic")) {
      return "**Strategic Assessment (Enterprise Mode)**\n\nLooking across all your operations:\n\n🔴 **Immediate Priority:** Quarterly tax payment due in 3 days (~$3,200)\n\n🟡 **This Week:** Follow up on overdue invoices to maintain cash flow\n\n🟢 **Strategic Initiative:** Your runway is stable — consider growth investments\n\n**Cross-Department View:**\n• Finance: Tax prep urgent\n• Marketing: Campaign performing +24% above benchmark\n• Operations: 3 workflows ready for automation\n\nI can coordinate across all areas. What would you like me to focus on?";
    }
    return "**Enterprise Mode Active** — Strategic & Cross-System Orchestration\n\nAs your virtual COO, I'm viewing your entire operation:\n\n• Cross-platform insights\n• Multi-department coordination\n• Scenario planning\n• High-impact decision support\n\nWhat strategic question can I help you with?";
  },
  finance: (input) => {
    const lower = input.toLowerCase();
    if (lower.includes("tax") || lower.includes("taxes")) {
      return "**Finance Mode — Tax Analysis**\n\nBased on your financial data:\n\n**Q4 Estimated Tax:** $3,200\n\n**Calculation:**\n• YTD Profit: ~$42,500\n• Estimated Rate: 30%\n• Q4 Portion: $3,200\n\n**Recommendation:** Set aside this amount by January 15.\n\n⚠️ *Note: This is an estimate. Consult a tax professional for official advice.*";
    }
    if (lower.includes("cash") || lower.includes("money") || lower.includes("flow")) {
      return "**Finance Mode — Cash Flow Analysis**\n\n**Current Position:**\n• Cash on Hand: $24,580\n• Monthly Burn Rate: $8,200 (↓5% from last month)\n• Runway: ~3 months\n\n**Assessment:** You're in a stable position. The reduced burn rate is positive.\n\n**Watch Items:**\n• ABC Corp invoice is overdue ($5,000)\n• Quarterly taxes due soon ($3,200)";
    }
    return "I'm in Finance mode, specializing in financial analysis and interpretation.\n\nI can help you understand:\n• Cash flow and runway\n• Tax obligations and set-asides\n• Expense patterns\n• Budget recommendations\n\nWhat financial question do you have?";
  },
  marketing: (input) => {
    return "**Marketing Mode Active**\n\n**Quick Insights:**\n• Email open rate: 24% (above industry avg)\n• Top performing content: How-to guides\n• Lead quality score: 7.2/10\n\nI can help with content ideas, campaign analysis, and audience insights. What marketing challenge are you working on?";
  },
  education: (input) => {
    return "**Education Mode — Your Learning Journey** 🎓\n\nBased on your recent activity, I recommend:\n\n**Priority Course:**\n📚 \"Understanding Cash Flow\" (45 min)\n*Triggered by: Recent cash flow questions*\n\n**Learning Path:**\n1. Cash Flow Basics\n2. Tax Planning for Business\n3. Building Business Credit\n\nShall I start the recommended course or show your full learning path?";
  }
};

export function VOPSyAgent() {
  const { user } = useAuth();
  const { currentMode, availableModes, switchMode, canAccessMode } = useVOPSyMode();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showModePicker, setShowModePicker] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "vopsy",
      modeId: "assistant",
      content: `Hey ${user?.name?.split(" ")[0] || "there"}! I'm VOPSy, your operations intelligence.\n\nI'm one agent with multiple operating modes — each giving me different capabilities and focus areas. Right now I'm in **Assistant mode**, ready to help, explain, and draft.\n\nSwitch modes anytime for specialized support.`,
      timestamp: new Date(),
      actions: [
        { label: "Review finances", action: "Switch to Finance mode and review my cash flow" },
        { label: "Check priorities", action: "Switch to Enterprise mode and show my strategic priorities" }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleModeSwitch = (modeId: VOPSyModeId) => {
    if (!canAccessMode(modeId)) return;
    
    switchMode(modeId);
    setShowModePicker(false);
    
    const mode = VOPSY_MODES[modeId];
    const switchMessage: Message = {
      id: crypto.randomUUID(),
      role: "vopsy",
      modeId: modeId,
      content: `**Switching to ${mode.fullName}**\n\n${mode.purpose}.\n\n${mode.capabilities.slice(0, 3).map(c => `• ${c}`).join('\n')}\n\nHow can I help you in this mode?`,
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

    const responseFunc = modeResponses[currentMode.id];
    const vopsyResponse: Message = {
      id: crypto.randomUUID(),
      role: "vopsy",
      modeId: currentMode.id,
      content: responseFunc(messageText),
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
        {/* Header with Mode Selector */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/20 to-primary/5 border-b border-border">
          <div className="relative">
            <button
              onClick={() => setShowModePicker(!showModePicker)}
              className="flex items-center gap-3 hover:bg-muted/50 px-2 py-1 rounded-lg transition-colors"
            >
              <div className={cn(
                "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                currentMode.color
              )}>
                <span className="text-sm">{currentMode.icon}</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-foreground text-sm">{currentMode.fullName}</h3>
                  <ChevronDown className={cn(
                    "w-3 h-3 text-muted-foreground transition-transform",
                    showModePicker && "rotate-180"
                  )} />
                </div>
                <p className="text-xs text-muted-foreground">{currentMode.purpose}</p>
              </div>
            </button>

            {/* Mode Picker Dropdown */}
            <AnimatePresence>
              {showModePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 top-full mt-2 w-72 rounded-xl bg-card border border-border shadow-xl z-10 p-2"
                >
                  <div className="px-3 py-2 mb-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Switch VOPSy Mode
                    </p>
                  </div>
                  {availableModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleModeSwitch(mode.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors mb-1",
                        currentMode.id === mode.id ? "bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                        mode.color
                      )}>
                        <span className="text-sm">{mode.icon}</span>
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground text-sm">{mode.name}</span>
                          {mode.requiresAdmin && (
                            <Shield className="w-3 h-3 text-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{mode.purpose}</p>
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
                const messageMode = message.modeId ? VOPSY_MODES[message.modeId] : null;
                
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
                    {message.role === "vopsy" && (
                      <div className={cn(
                        "w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                        messageMode?.color || "from-primary to-orange-400"
                      )}>
                        <span className="text-xs">{messageMode?.icon || "⚡"}</span>
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[85%] rounded-xl px-4 py-3",
                      message.role === "vopsy" 
                        ? "bg-muted text-foreground" 
                        : "bg-primary text-primary-foreground"
                    )}>
                      {message.role === "vopsy" && messageMode && (
                        <p className="text-[10px] text-muted-foreground mb-1 font-medium">
                          {messageMode.fullName}
                        </p>
                      )}
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
                    currentMode.color
                  )}>
                    <span className="text-xs">{currentMode.icon}</span>
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
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Ask VOPSy (${currentMode.name} mode)...`}
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
