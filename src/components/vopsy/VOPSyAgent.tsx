import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  Send, 
  Loader2,
  MessageSquare,
  Paperclip,
  Mail,
  RefreshCw
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTier } from "@/contexts/UserTierContext";
import { supabase } from "@/integrations/supabase/client";
import { useVOPSyEmailIntelligence } from "@/hooks/useVOPSyEmailIntelligence";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "vopsy";
  content: string;
  timestamp: Date;
  actions?: { label: string; action: string }[];
}

export function VOPSyAgent() {
  const { user } = useAuth();
  const { currentTier } = useUserTier();
  const emailIntelligence = useVOPSyEmailIntelligence();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "vopsy",
      content: `Hey ${user?.name?.split(" ")[0] || "there"}! I'm VOPSy — your Virtual OPS Intelligence.\n\nI'm your single AI agent covering **all business operations**: finance, compliance, marketing, operations, and education.\n\n📧 **New: Inbox Intelligence** — Say "scan inbox" to analyze your emails and I'll help you process them with contextual responses.\n\nYou're on the **${currentTier.displayName}** plan.`,
      timestamp: new Date(),
      actions: [
        { label: "📧 Scan my inbox", action: "Scan my inbox" },
        { label: "💰 Review cash flow", action: "Show me my current cash flow and runway" },
        { label: "🎯 What should I focus on?", action: "What are my strategic priorities this week?" }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    try {
      // Check for email-related intent first
      const emailIntent = emailIntelligence.parseEmailIntent(messageText);
      
      if (emailIntent) {
        // Handle email action
        const emailResponse = await emailIntelligence.executeEmailAction(emailIntent);
        
        if (emailResponse) {
          const vopsyResponse: Message = {
            id: crypto.randomUUID(),
            role: "vopsy",
            content: emailResponse,
            timestamp: new Date(),
            actions: getEmailActions(emailIntent.type)
          };
          setMessages(prev => [...prev, vopsyResponse]);
          setIsTyping(false);
          return;
        }
      }

      // Call the VOPSy chat edge function for non-email queries
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      conversationHistory.push({ role: 'user', content: messageText });

      // Include email context in user context
      const emailContext = emailIntelligence.buildEmailContextForPrompt();
      
      // Map tier ID to vopsy tier capability
      const vopsyTierMap: Record<string, string> = {
        'free': 'free',
        'ai_assistant': 'assistant',
        'ai_operations': 'operations',
        'ai_enterprise': 'operations',
        'ai_advisory': 'ai_advisory',
        'ai_tax': 'ai_tax',
        'ai_compliance': 'ai_compliance',
      };
      
      const userContext = {
        userName: user?.name || 'User',
        tier: currentTier.id,
        vopsyTier: vopsyTierMap[currentTier.id] || 'free',
        emailContext: emailContext,
      };

      const { data, error } = await supabase.functions.invoke('vopsy-chat', {
        body: {
          messages: conversationHistory,
          userContext,
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get response');
      }

      const vopsyResponse: Message = {
        id: crypto.randomUUID(),
        role: "vopsy",
        content: data.message || "I apologize, but I couldn't process that request. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, vopsyResponse]);
    } catch (error) {
      console.error('VOPSy error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "vopsy",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Generate contextual action buttons based on email state
  const getEmailActions = (actionType: string): { label: string; action: string }[] | undefined => {
    const ctx = emailIntelligence.getEmailContext();
    
    switch (actionType) {
      case 'scan_inbox':
        if (ctx.totalEmails > 0) {
          return [
            { label: "📧 Show emails", action: "Show emails" },
            { label: "🔴 Skip to urgent", action: "Skip to urgent" }
          ];
        }
        return undefined;
      
      case 'show_emails':
      case 'next_email':
      case 'prev_email':
      case 'skip_to_urgent':
        return [
          { label: "✍️ Draft reply", action: "Draft reply" },
          { label: "➡️ Next", action: "Next" },
          { label: "📊 Summary", action: "Back to summary" }
        ];
      
      case 'draft_reply':
      case 'refine_draft':
        return [
          { label: "📤 Send it", action: "Send it" },
          { label: "✏️ Make it shorter", action: "Make it shorter" },
          { label: "🔄 Start over", action: "Draft reply" }
        ];
      
      case 'send_draft':
        if (ctx.currentEmailIndex < ctx.totalEmails) {
          return [
            { label: "➡️ Next email", action: "Next" },
            { label: "📊 Summary", action: "Back to summary" }
          ];
        }
        return [
          { label: "📊 Summary", action: "Back to summary" },
          { label: "🔄 Scan again", action: "Scan inbox" }
        ];
      
      default:
        return undefined;
    }
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
          "bg-card backdrop-blur-xl flex flex-col",
          isMinimized ? "h-16" : "h-[36rem]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/20 to-primary/5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">VOPSy</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Virtual OPS Intelligence
                {emailIntelligence.status?.connected && (
                  <Mail className="w-3 h-3 text-green-500" />
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {emailIntelligence.isProcessing && (
              <RefreshCw className="w-4 h-4 text-primary animate-spin" />
            )}
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    <div className="text-sm prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    
                    {message.actions && message.role === "vopsy" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {message.actions.map((action) => (
                          <button
                            key={action.action}
                            onClick={() => handleSend(action.action)}
                            disabled={isTyping || emailIntelligence.isProcessing}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {(isTyping || emailIntelligence.isProcessing) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {emailIntelligence.isAnalyzing ? "Analyzing your inbox..." : 
                         emailIntelligence.isSending ? "Sending email..." :
                         "VOPSy is thinking..."}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 shrink-0">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-muted border border-border">
                <button className="p-1.5 rounded-lg hover:bg-background/50 transition-colors text-muted-foreground hover:text-foreground">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSend()}
                  placeholder="Ask VOPSy anything..."
                  disabled={isTyping || emailIntelligence.isProcessing}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none px-2 disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping || emailIntelligence.isProcessing}
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
