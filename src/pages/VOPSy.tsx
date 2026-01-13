import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Send, 
  Sparkles,
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
  BookOpen
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVOPSyChat } from "@/hooks/useVOPSyChat";
import { cn } from "@/lib/utils";

const quickActions = [
  { icon: TrendingUp, label: "Cash flow analysis", prompt: "Analyze my cash flow and runway. What's my current financial position?", category: "Finance" },
  { icon: Mail, label: "Check my inbox", prompt: "Check my inbox and summarize the important emails I need to respond to today", category: "Operations" },
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
  const { messages, isLoading, sendMessage, clearHistory } = useVOPSyChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    await sendMessage(message);
    textareaRef.current?.focus();
  };

  const handleQuickAction = async (prompt: string) => {
    await sendMessage(prompt);
  };

  return (
    <AccessGate>
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        
        <main className="flex-1 ml-64 flex flex-col h-screen">
          {/* Header */}
          <div className="p-6 border-b border-border bg-card/50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-orange-500 shadow-lg">
                    <Brain className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    VOPSy
                    <Badge variant="secondary" className="text-xs">AI Assistant</Badge>
                  </h1>
                  <p className="text-sm text-muted-foreground">Your Virtual Operations Intelligence</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                New Chat
              </Button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1" ref={scrollRef}>
              <div className="p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        layout
                        className={cn(
                          "flex gap-3",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "vopsy" && (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shrink-0 mt-1">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                        )}
                        
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-5 py-4",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {message.role === "vopsy" && !message.isStreaming && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-semibold text-primary">VOPSy</span>
                            </div>
                          )}
                          
                          {message.isStreaming ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              <span className="text-sm text-muted-foreground">VOPSy is thinking...</span>
                            </div>
                          ) : (
                            <div className="text-sm leading-relaxed">
                              {formatMessage(message.content)}
                            </div>
                          )}
                          
                          {!message.isStreaming && (
                            <p className={cn(
                              "text-[10px] mt-3",
                              message.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                            )}>
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                        
                        {message.role === "user" && (
                          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-1">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="px-6 py-4 border-t border-border bg-card/30 shrink-0">
              <div className="max-w-3xl mx-auto">
                <p className="text-xs text-muted-foreground mb-3 font-medium">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                      onClick={() => handleQuickAction(action.prompt)}
                      disabled={isLoading}
                    >
                      <action.icon className="w-3.5 h-3.5" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-border bg-card shrink-0">
              <div className="max-w-3xl mx-auto">
                <div className="flex gap-3">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Ask VOPSy anything... (e.g., 'What are my priorities today?' or 'Help me with tax planning')"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="min-h-[60px] max-h-[120px] resize-none bg-background"
                    disabled={isLoading}
                  />
                  <Button 
                    size="lg" 
                    className="px-6 shrink-0"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  VOPSy can help with finance, operations, marketing, compliance, and education • Powered by AI
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AccessGate>
  );
}
