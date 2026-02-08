import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VOPSyMascot } from "@/components/brand/VOPSyMascot";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const TIER_GREETINGS: Record<string, string> = {
  free: "Hi! I'm VOPSy, your AI operations partner. I can answer questions, point you to courses, and help you understand your business better. What would you like to know?",
  assistant: "Hey! I'm VOPSy, your AI operations partner. I can analyze your connected data, give smart recommendations, and provide financial insights. What can I help you with?",
  operations: "Welcome back! I'm VOPSy, your AI operations director. I can execute tasks, automate workflows, and keep your business running smoothly. What should we tackle today?",
  advisory: "Hello! I'm VOPSy, your AI operations partner working alongside Tania Potter. I have full execution authority and can support your strategic planning. How can I assist you today?",
  tax: "Hi! I'm VOPSy. I can answer questions and guide you through tax preparation. I'll also remind you of important filing deadlines. What do you need help with?",
  compliance: "Hi! I'm VOPSy. I can help you stay on top of compliance requirements and deadlines. What can I assist you with today?",
  enterprise: "Welcome! I'm VOPSy, your dedicated AI operations director. I have full execution authority and account-level support. What can I do for you today?",
  cohort: "Hey! I'm VOPSy, your AI operations director and cohort facilitator. I can execute tasks, automate workflows, and support your group learning. What should we work on?",
  owner: "Hi Tania! I'm VOPSy, your AI operations partner. I have full access and can help you manage the platform and support your clients. What do you need?",
};

export function HubVOPSyChat() {
  const { user, selectedTier } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Set welcome message based on tier
  useEffect(() => {
    const tier = selectedTier || "free";
    const greeting = TIER_GREETINGS[tier] || TIER_GREETINGS.free;
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    }]);
  }, [selectedTier]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      conversationHistory.push({ role: "user", content: content.trim() });

      // Call vopsy-chat with user's actual tier
      const { data, error } = await supabase.functions.invoke("vopsy-chat", {
        body: {
          messages: conversationHistory,
          user_tier: selectedTier || "free",
          user_id: user?.id,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data?.reply || "I apologize, but I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-secondary/5">
        <VOPSyMascot size="sm" />
        <div>
          <h3 className="font-semibold text-lg">VOPSy AI</h3>
          <p className="text-sm text-muted-foreground">Your Operations Partner</p>
        </div>
        <Sparkles className="ml-auto h-5 w-5 text-primary" />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <VOPSyMascot size="xs" className="mt-1 flex-shrink-0" />
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <VOPSyMascot size="xs" className="mt-1 flex-shrink-0" />
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask VOPSy anything..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px] flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
