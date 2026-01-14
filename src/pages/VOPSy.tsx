import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Send, 
  MessageSquare,
  ListTodo,
  Calendar,
  Mail,
  Zap,
  RefreshCw,
  Loader2,
  TrendingUp,
  FileText,
  Target,
  BookOpen,
  Mic,
  MicOff,
  Volume2,
  Link
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVOPSyChat, ChatMessage } from "@/hooks/useVOPSyChat";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useInboxIntelligence } from "@/hooks/useInboxIntelligence";
import { useFinancialIntelligence } from "@/hooks/useFinancialIntelligence";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { VOPSyMascot } from "@/components/brand/VOPSyMascot";

// Keywords that trigger inbox intelligence
const INBOX_KEYWORDS = ['inbox', 'email', 'emails', 'mail', 'messages', 'unread'];

// Keywords that trigger financial intelligence
const FINANCIAL_KEYWORDS = ['cash flow', 'cashflow', 'invoices', 'invoice', 'receivables', 'financial', 'finances', 'balance', 'revenue', 'payments', 'overdue', 'stripe', 'quickbooks', 'xero', 'accounting', 'money'];

const quickActions = [
  { icon: TrendingUp, label: "Cash flow analysis", prompt: "Show me my current cash flow and financial position from my connected accounts", category: "Finance", isFinancial: true },
  { icon: Mail, label: "Check my inbox", prompt: "Go ahead — scan my real inbox and show me what needs attention", category: "Operations", isInbox: true },
  { icon: ListTodo, label: "Today's priorities", prompt: "What should be my top priorities today? Give me a strategic assessment.", category: "Strategy" },
  { icon: Calendar, label: "Schedule tasks", prompt: "Help me plan and schedule my tasks for this week", category: "Operations" },
  { icon: Zap, label: "Automate workflow", prompt: "Suggest automations for my repetitive tasks. What processes can I optimize?", category: "Operations" },
  { icon: FileText, label: "Tax planning", prompt: "Help me with tax planning. What are my estimated quarterly taxes and upcoming deadlines?", category: "Finance" },
  { icon: Target, label: "Marketing insights", prompt: "Give me marketing insights. How are my campaigns performing and what should I focus on?", category: "Marketing" },
  { icon: BookOpen, label: "Learning path", prompt: "Recommend a learning path for me based on my business needs", category: "Education" },
];

// Simple markdown-like formatting
function formatMessage(content: string) {
  // Split by double newlines for paragraphs
  const paragraphs = content.split(/\n\n+/);
  
  return paragraphs.map((para, pIdx) => {
    // Handle bullet points
    if (para.includes('\n•') || para.startsWith('•')) {
      const lines = para.split('\n');
      return (
        <div key={pIdx} className="space-y-1">
          {lines.map((line, lIdx) => {
            if (line.startsWith('•')) {
              return (
                <div key={lIdx} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{formatInlineText(line.slice(1).trim())}</span>
                </div>
              );
            }
            return <p key={lIdx}>{formatInlineText(line)}</p>;
          })}
        </div>
      );
    }
    
    // Regular paragraph
    return <p key={pIdx} className="mb-2 last:mb-0">{formatInlineText(para)}</p>;
  });
}

function formatInlineText(text: string) {
  // Handle **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function VOPSy() {
  const { messages, isLoading, sendMessage, clearHistory, addAssistantMessage } = useVOPSyChat();
  const [input, setInput] = useState("");
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Inbox intelligence hook
  const { 
    analyzeInbox, 
    formatAnalysisForChat, 
    draftReply,
    sendDraft,
    clearDraft,
    formatDraftForChat,
    getEmailByNumber,
    findEmailByKeyword,
    analysis: currentAnalysis,
    currentDraft,
    status: inboxStatus 
  } = useInboxIntelligence();

  // Financial intelligence hook
  const {
    fetchFinancialData,
    formatFinancialForChat,
    isLoading: isFinancialLoading,
    status: financialStatus,
  } = useFinancialIntelligence();

  // Voice input hook
  const {
    isListening,
    isSupported: isVoiceSupported,
    interimTranscript,
    error: voiceError,
    toggleListening,
    stopListening,
  } = useVoiceInput({
    onTranscript: (text) => {
      if (text.trim()) {
        setInput(prev => prev + (prev ? ' ' : '') + text);
      }
    },
    onInterimTranscript: (text) => {
      console.log('Interim:', text);
    },
  });

  // Check if message is inbox-related
  const isInboxRequest = useCallback((text: string) => {
    const lower = text.toLowerCase();
    return INBOX_KEYWORDS.some(kw => lower.includes(kw)) && 
           (lower.includes('check') || lower.includes('scan') || lower.includes('go ahead') || 
            lower.includes('show') || lower.includes('analyze') || lower.includes('summarize') ||
            lower.includes('what') || lower.includes('need'));
  }, []);

  // Check if message is financial-related
  const isFinancialRequest = useCallback((text: string) => {
    const lower = text.toLowerCase();
    return FINANCIAL_KEYWORDS.some(kw => lower.includes(kw)) && 
           (lower.includes('show') || lower.includes('what') || lower.includes('analyze') || 
            lower.includes('check') || lower.includes('my') || lower.includes('current') ||
            lower.includes('how much') || lower.includes('position'));
  }, []);

  // Check if message is a draft request
  const isDraftRequest = useCallback((text: string): { isDraft: boolean; emailNum?: number; keyword?: string; tone?: 'professional' | 'friendly' | 'brief' | 'detailed' } => {
    const lower = text.toLowerCase();
    
    if (!lower.includes('draft') && !lower.includes('reply') && !lower.includes('respond')) {
      return { isDraft: false };
    }

    // Extract email number (e.g., "draft reply to #1" or "reply to 2")
    const numMatch = lower.match(/(?:#|number\s*)?(\d+)/);
    const emailNum = numMatch ? parseInt(numMatch[1], 10) : undefined;

    // Detect tone
    let tone: 'professional' | 'friendly' | 'brief' | 'detailed' | undefined;
    if (lower.includes('friendly') || lower.includes('casual') || lower.includes('warm')) {
      tone = 'friendly';
    } else if (lower.includes('brief') || lower.includes('short') || lower.includes('concise')) {
      tone = 'brief';
    } else if (lower.includes('detailed') || lower.includes('thorough') || lower.includes('comprehensive')) {
      tone = 'detailed';
    } else {
      tone = 'professional';
    }

    // If no number, try to find a keyword
    let keyword: string | undefined;
    if (!emailNum) {
      // Common patterns: "reply to the invoice email", "draft response to meeting request"
      const keywordPatterns = [
        /(?:reply|respond|draft)\s+(?:to\s+)?(?:the\s+)?(.+?)(?:\s+email)?$/,
        /(?:about|regarding)\s+(.+)$/,
      ];
      for (const pattern of keywordPatterns) {
        const match = lower.match(pattern);
        if (match && match[1] && match[1].length > 2) {
          keyword = match[1].trim();
          break;
        }
      }
    }

    return { isDraft: true, emailNum, keyword, tone };
  }, []);

  // Check if message is a send request
  const isSendRequest = useCallback((text: string): boolean => {
    const lower = text.toLowerCase();
    const sendPatterns = [
      'send it', 'send this', 'send the email', 'send the reply', 'send the draft',
      'go ahead and send', 'yes send', 'please send', 'send now', 'ship it',
      'looks good send', 'send away', 'fire it off', 'deliver it'
    ];
    return sendPatterns.some(pattern => lower.includes(pattern));
  }, []);

  // Handle send request
  const handleSendRequest = useCallback(async () => {
    if (!currentDraft) {
      addAssistantMessage(`📝 I don't have a draft ready to send. Would you like me to draft a reply to one of your emails first?`);
      return;
    }

    setIsSendingEmail(true);
    addAssistantMessage(`📤 Sending your reply...`);

    const result = await sendDraft();
    
    if (result.success) {
      addAssistantMessage(`✅ **Email sent successfully!**

Your reply has been delivered. Is there anything else you'd like me to help with?

• Check for more emails to respond to
• Draft another reply
• Something else entirely`);
    } else {
      addAssistantMessage(`❌ **Couldn't send the email**

${result.error || 'An unexpected error occurred.'}

Would you like me to try again, or would you prefer to make changes to the draft first?`);
    }

    setIsSendingEmail(false);
  }, [currentDraft, sendDraft, addAssistantMessage]);

  // Handle draft request
  const handleDraftRequest = useCallback(async (emailNum?: number, keyword?: string, tone: 'professional' | 'friendly' | 'brief' | 'detailed' = 'professional') => {
    if (!currentAnalysis) {
      addAssistantMessage(`📭 I don't have any emails loaded yet. Let me check your inbox first...`);
      await handleInboxRequest();
      return;
    }

    // Find the email
    let email = emailNum ? getEmailByNumber(emailNum) : null;
    if (!email && keyword) {
      email = findEmailByKeyword(keyword);
    }

    if (!email) {
      addAssistantMessage(`🤔 I couldn't find that email. Try saying "draft reply to #1" with a number from the inbox report, or mention a keyword from the email subject.`);
      return;
    }

    setIsDrafting(true);
    addAssistantMessage(`✍️ Drafting a ${tone} reply to "${email.subject}"...`);

    const draft = await draftReply(email, tone);
    
    if (draft) {
      const formattedDraft = formatDraftForChat(draft, email.subject);
      addAssistantMessage(formattedDraft);
    } else {
      addAssistantMessage(`❌ Sorry, I had trouble drafting that reply. Please try again.`);
    }

    setIsDrafting(false);
  }, [currentAnalysis, getEmailByNumber, findEmailByKeyword, draftReply, formatDraftForChat, addAssistantMessage]);

  // Handle inbox analysis with real data
  const handleInboxRequest = useCallback(async () => {
    setIsInboxLoading(true);
    
    const analysis = await analyzeInbox();
    
    if (!analysis) {
      // Not connected - provide helpful message
      const notConnectedMsg = `🔐 **Inbox Access Check**

I'd love to scan your real inbox, but I don't have access yet!

To enable **Inbox Intelligence**, you'll need to connect your email account:
• **Google Workspace** — Gmail, Calendar, Drive
• **Microsoft 365** — Outlook, Teams, OneDrive

👉 **[Go to Integrations](/integrations)** to connect your email account.

Once connected, I'll be able to:
• Scan your unread and flagged emails
• Identify messages that need a reply or decision  
• Group them by priority (🔴 Urgent, 🟡 Needs Response, 🟢 FYI)
• Give you plain-English summaries
• Draft replies when you're ready

Want me to help with something else in the meantime?`;
      
      addAssistantMessage(notConnectedMsg);
    } else {
      // Connected - show real analysis
      const formattedAnalysis = formatAnalysisForChat(analysis);
      addAssistantMessage(formattedAnalysis);
    }
    
    setIsInboxLoading(false);
  }, [analyzeInbox, formatAnalysisForChat, addAssistantMessage]);

  // Handle financial data request
  const handleFinancialRequest = useCallback(async () => {
    addAssistantMessage(`💰 Fetching your financial data...`);
    
    const financialData = await fetchFinancialData();
    
    if (!financialData) {
      const notConnectedMsg = `🔐 **Financial Access Check**

I'd love to show you real financial data, but I don't have access yet!

To enable **Financial Intelligence**, connect one or more of these accounts:
• **QuickBooks** — Invoices, expenses, reports
• **Stripe** — Payments, subscriptions, balances
• **Xero** — Accounting, invoices, bank reconciliation

👉 **[Go to Integrations](/integrations)** to connect your financial accounts.

Once connected, I'll be able to:
• Show your real-time cash position
• List unpaid and overdue invoices
• Track recent payments and transactions
• Alert you to financial action items

Would you like help with something else?`;
      
      addAssistantMessage(notConnectedMsg);
    } else {
      const formattedFinancial = formatFinancialForChat(financialData);
      addAssistantMessage(formattedFinancial);
    }
  }, [fetchFinancialData, formatFinancialForChat, addAssistantMessage]);

  // Show voice error as toast
  useEffect(() => {
    if (voiceError) {
      toast({
        variant: "destructive",
        title: "Voice Input Error",
        description: voiceError,
      });
    }
  }, [voiceError, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isInboxLoading || isDrafting || isSendingEmail || isFinancialLoading) return;
    stopListening();
    const message = input.trim();
    setInput("");

    // Check if this is a send request
    if (isSendRequest(message)) {
      await sendMessage(message, true);
      await handleSendRequest();
      textareaRef.current?.focus();
      return;
    }

    // Check if this is a draft request
    const draftCheck = isDraftRequest(message);
    if (draftCheck.isDraft) {
      await sendMessage(message, true);
      await handleDraftRequest(draftCheck.emailNum, draftCheck.keyword, draftCheck.tone);
      textareaRef.current?.focus();
      return;
    }

    // Check if this is a financial request
    if (isFinancialRequest(message)) {
      await sendMessage(message, true);
      await handleFinancialRequest();
      textareaRef.current?.focus();
      return;
    }

    // Check if this is an inbox request
    if (isInboxRequest(message)) {
      await sendMessage(message, true);
      await handleInboxRequest();
    } else {
      await sendMessage(message);
    }
    
    textareaRef.current?.focus();
  };

  const handleQuickAction = async (prompt: string, isInbox?: boolean, isFinancial?: boolean) => {
    stopListening();
    
    if (isFinancial) {
      await sendMessage(prompt, true);
      await handleFinancialRequest();
    } else if (isInbox) {
      await sendMessage(prompt, true);
      await handleInboxRequest();
    } else {
      await sendMessage(prompt);
    }
  };

  const handleVoiceToggle = () => {
    if (!isVoiceSupported) {
      toast({
        variant: "destructive",
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice input. Try Chrome or Edge.",
      });
      return;
    }
    toggleListening();
  };

  return (
    <AccessGate>
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64 flex flex-col h-screen pt-14 lg:pt-0">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-border bg-card/50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12">
                    <VOPSyMascot size="sm" animate={true} className="!w-10 !h-10 sm:!w-12 sm:!h-12" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-success rounded-full border-2 border-card animate-pulse" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
                    VOPSy
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">AI Assistant</Badge>
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Your Virtual Operations Intelligence</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">New Chat</span>
              </Button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1" ref={scrollRef}>
              <div className="p-4 sm:p-6">
                <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        layout
                        className={cn(
                          "flex gap-2 sm:gap-3",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "vopsy" && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 mt-1">
                            <VOPSyMascot size="sm" animate={false} className="!w-8 !h-8 sm:!w-10 sm:!h-10" />
                          </div>
                        )}
                        
                        <div
                          className={cn(
                            "max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {message.role === "vopsy" && !message.isStreaming && (
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                              <span className="text-[10px] sm:text-xs font-semibold text-primary">VOPSy</span>
                            </div>
                          )}
                          
                          {message.isStreaming ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-primary" />
                              <span className="text-xs sm:text-sm text-muted-foreground">VOPSy is thinking...</span>
                            </div>
                          ) : (
                            <div className="text-xs sm:text-sm leading-relaxed">
                              {formatMessage(message.content)}
                            </div>
                          )}
                          
                          {!message.isStreaming && (
                            <p className={cn(
                              "text-[9px] sm:text-[10px] mt-2 sm:mt-3",
                              message.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                            )}>
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                        
                        {message.role === "user" && (
                          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-1">
                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-card/30 shrink-0">
              <div className="max-w-3xl mx-auto">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 font-medium">Quick Actions</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {quickActions.slice(0, 6).map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-[10px] sm:text-xs gap-1 sm:gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30 px-2 sm:px-3 py-1 h-auto",
                        (action.isInbox || action.isFinancial) && "border-primary/30 bg-primary/5"
                      )}
                      onClick={() => handleQuickAction(action.prompt, action.isInbox, action.isFinancial)}
                      disabled={isLoading || isInboxLoading || isFinancialLoading}
                    >
                      {(action.isInbox && isInboxLoading) || (action.isFinancial && isFinancialLoading) ? (
                        <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                      ) : (
                        <action.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      )}
                      <span className="hidden sm:inline">{action.label}</span>
                      <span className="sm:hidden">{action.label.split(' ')[0]}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-6 border-t border-border bg-card shrink-0">
              <div className="max-w-3xl mx-auto">
                {/* Voice listening indicator */}
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <div className="relative">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-pulse" />
                          </div>
                          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-primary">Listening...</p>
                          {interimTranscript && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground italic truncate">"{interimTranscript}"</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stopListening}
                          className="text-primary hover:text-primary hover:bg-primary/20 text-xs"
                        >
                          Stop
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      placeholder={isListening ? "Speak now..." : "Ask VOPSy anything..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      className={cn(
                        "min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none bg-background pr-10 sm:pr-12 text-sm",
                        isListening && "border-primary ring-1 ring-primary"
                      )}
                      disabled={isLoading}
                    />
                    {/* Voice button inside textarea */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceToggle}
                      disabled={isLoading}
                      className={cn(
                        "absolute right-1.5 sm:right-2 top-1.5 sm:top-2 p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8",
                        isListening 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {isListening ? (
                        <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                  </div>
                  <Button 
                    size="lg" 
                    className="px-4 sm:px-6 shrink-0 h-auto"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-2 text-center">
                  {isVoiceSupported 
                    ? "💬 Type or 🎤 speak to VOPSy • Powered by AI"
                    : "VOPSy can help with finance, operations, marketing, compliance, and education • Powered by AI"
                  }
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AccessGate>
  );
}
