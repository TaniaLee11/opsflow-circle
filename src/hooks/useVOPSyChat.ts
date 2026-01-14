import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from '@/contexts/UserTierContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'vopsy';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface UserContext {
  userName: string;
  userTier: string;
  tierCapabilities: string[];
  isOwner: boolean;
}

const WELCOME_MESSAGE = (name: string, tierName: string): ChatMessage => ({
  id: 'welcome',
  role: 'vopsy',
  content: `Hey ${name}! 👋 I'm **VOPSy** — your Virtual Operations Intelligence.

I'm your all-in-one AI business assistant covering:
• **Finance** — Cash flow, taxes, budgeting, invoices
• **Operations** — Workflows, automations, task management
• **Marketing** — Campaigns, content strategy, analytics
• **Compliance** — Deadlines, regulations, documentation
• **Education** — Learning paths, courses, best practices

You're on the **${tierName}** plan. What can I help you with today?`,
  timestamp: new Date(),
});

export function useVOPSyChat() {
  const { user, isOwner } = useAuth();
  const { currentTier } = useUserTier();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMsg = WELCOME_MESSAGE(
      user?.name?.split(' ')[0] || 'there',
      currentTier.displayName
    );
    setMessages([welcomeMsg]);
    messagesRef.current = [welcomeMsg];
  }, [user?.name, currentTier.displayName]);

  // Keep ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = useCallback(async (content: string, skipAI: boolean = false) => {
    if (!content.trim() || isLoading) return;

    setError(null);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // If skipAI is true, just add the user message without calling the AI
    if (skipAI) {
      return;
    }

    setIsLoading(true);

    // Add typing indicator
    const typingId = crypto.randomUUID();
    const typingMessage: ChatMessage = {
      id: typingId,
      role: 'vopsy',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Build user context for the AI
      const userContext: UserContext = {
        userName: user?.name || 'User',
        userTier: currentTier.displayName,
        tierCapabilities: currentTier.capabilities,
        isOwner,
      };

      // Get conversation history (exclude typing indicator)
      const conversationHistory = [...messagesRef.current, userMessage]
        .filter(m => !m.isStreaming)
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      const { data, error: fnError } = await supabase.functions.invoke('vopsy-chat', {
        body: {
          messages: conversationHistory,
          userContext,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to get response');
      }

      // Replace typing indicator with actual response
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'vopsy',
        content: data.message || "I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(m => m.id !== typingId).concat(assistantMessage));
    } catch (err) {
      console.error('VOPSy chat error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      
      // Replace typing indicator with error message
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'vopsy',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. 🔄",
        timestamp: new Date(),
      };
      setMessages(prev => prev.filter(m => m.id !== typingId).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, user?.name, currentTier, isOwner]);

  // Add an assistant message directly (for inbox intelligence, etc.)
  const addAssistantMessage = useCallback((content: string) => {
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'vopsy',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);
  }, []);

  const clearHistory = useCallback(() => {
    const welcomeMsg = WELCOME_MESSAGE(
      user?.name?.split(' ')[0] || 'there',
      currentTier.displayName
    );
    setMessages([welcomeMsg]);
    messagesRef.current = [welcomeMsg];
  }, [user?.name, currentTier.displayName]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    addAssistantMessage,
  };
}
