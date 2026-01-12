import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  Send, 
  Mic, 
  MicOff,
  Loader2,
  ChevronRight,
  Zap,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "vopsy";
  content: string;
  timestamp: Date;
  actions?: { label: string; action: string }[];
}

const contextualSuggestions = {
  dashboard: [
    "What should I focus on today?",
    "Summarize my financial health",
    "Are there any urgent items?"
  ],
  financial: [
    "Explain my cash flow",
    "How much should I set aside for taxes?",
    "What expenses can I reduce?"
  ],
  default: [
    "What can you help me with?",
    "Show me my priorities",
    "Draft a client follow-up"
  ]
};

export function VOPSyAgent() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "vopsy",
      content: `Hey ${user?.name?.split(" ")[0] || "there"}! I'm VOPSy, your operations intelligence. I can help you understand your business, complete tasks, and make decisions. What would you like to tackle?`,
      timestamp: new Date(),
      actions: [
        { label: "Review my finances", action: "review_finances" },
        { label: "Check priorities", action: "check_priorities" }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const suggestions = contextualSuggestions.default;

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

    // Simulate VOPSy response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const vopsyResponse: Message = {
      id: crypto.randomUUID(),
      role: "vopsy",
      content: getVOPSyResponse(messageText),
      timestamp: new Date(),
      actions: [
        { label: "Tell me more", action: "more" },
        { label: "Take action", action: "action" }
      ]
    };

    setMessages(prev => [...prev, vopsyResponse]);
    setIsTyping(false);
  };

  const getVOPSyResponse = (input: string): string => {
    const lower = input.toLowerCase();
    
    if (lower.includes("focus") || lower.includes("priorit")) {
      return "Based on your current situation, here's what I recommend focusing on:\n\n**1. Quarterly Tax Payment** — Due in 3 days. I've calculated you should set aside $3,200.\n\n**2. Invoice Follow-up** — ABC Corp payment is 5 days overdue. Want me to draft a reminder?\n\n**3. Cash Runway** — At current burn, you have 2.8 months. Consider reducing non-essential expenses.";
    }
    
    if (lower.includes("cash") || lower.includes("financ") || lower.includes("money")) {
      return "Here's your financial snapshot:\n\n**Cash on Hand:** $24,580 (healthy for your stage)\n**Monthly Burn:** $8,200 (down 5% — nice!)\n**Runway:** 3 months at current spending\n\n💡 You're in a stable position. The main action item is your upcoming tax payment. Want me to set up an automatic set-aside?";
    }
    
    if (lower.includes("tax")) {
      return "Your estimated quarterly tax payment is **$3,200**, due January 15.\n\nThis is based on:\n• YTD profit: ~$42,500\n• Estimated rate: 30%\n• Q4 portion: $3,200\n\nI can help you:\n1. Transfer to your tax savings account\n2. Set up automatic tax set-asides\n3. Connect with a tax professional\n\nWhat works best for you?";
    }
    
    if (lower.includes("draft") || lower.includes("write") || lower.includes("email")) {
      return "I'll draft that for you. Here's a professional follow-up:\n\n---\n\n**Subject:** Quick follow-up on Invoice #1247\n\nHi [Name],\n\nHope you're doing well! I wanted to check in on Invoice #1247 for $5,000, which was due on January 5th.\n\nPlease let me know if you need any additional information to process the payment.\n\nThanks!\n[Your name]\n\n---\n\nWant me to send this, or would you like to edit it first?";
    }
    
    return "I understand you're asking about \"" + input + "\". Let me help with that.\n\nBased on your current operations data, I can:\n• Analyze relevant metrics\n• Draft communications\n• Set up automations\n• Guide you through next steps\n\nWhat specifically would you like me to do?";
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
          "fixed bottom-6 right-6 z-50 w-96 rounded-2xl overflow-hidden shadow-2xl border border-border",
          "bg-card backdrop-blur-xl",
          isMinimized ? "h-16" : "h-[32rem]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/20 to-primary/5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">VOPSy</h3>
              <p className="text-xs text-muted-foreground">Your Operations Intelligence</p>
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
            <div className="flex-1 h-80 overflow-y-auto p-4 space-y-4">
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
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-xl px-4 py-3",
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
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
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

            {/* Suggestions */}
            <div className="px-4 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors whitespace-nowrap shrink-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-muted border border-border">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask VOPSy anything..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none px-2"
                />
                <button
                  onClick={() => setIsListening(!isListening)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isListening ? "bg-destructive text-destructive-foreground" : "hover:bg-background"
                  )}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
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
