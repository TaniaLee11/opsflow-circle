import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from '@/contexts/UserTierContext';
import { useVOPSyTierCapabilities, VOPSyCapability } from '@/hooks/useVOPSyTierCapabilities';

export interface ChatMessage {
  id: string;
  role: 'user' | 'vopsy';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  showUpgradeNudge?: boolean;
  suggestedTier?: 'free' | 'assistant' | 'operations';
  capabilityBlocked?: VOPSyCapability;
}

interface UserContext {
  userName: string;
  userTier: string;
  tierCapabilities: string[];
  isOwner: boolean;
  vopsyTier: string;
  canRead: boolean;
  canWrite: boolean;
  canExecute: boolean;
}

// Standard welcome message (not first-login - that's handled separately)
const WELCOME_MESSAGE = (name: string, tierName: string, vopsyTierName: string): ChatMessage => ({
  id: 'welcome',
  role: 'vopsy',
  content: `Hey ${name}! 👋 I'm **VOPSy** — your Virtual Operations Intelligence.

I'm your all-in-one AI business assistant covering:
• **Finance** — Cash flow, taxes, budgeting, invoices
• **Operations** — Workflows, automations, task management
• **Marketing** — Campaigns, content strategy, analytics
• **Compliance** — Deadlines, regulations, documentation
• **Education** — Learning paths, courses, best practices

You're on **${tierName}** (${vopsyTierName} capabilities). What can I help you with today?`,
  timestamp: new Date(),
});

export function useVOPSyChat() {
  const { user, isOwner } = useAuth();
  const { currentTier } = useUserTier();
  const { tier: vopsyTier, tierDisplayName, canRead, canWrite, canExecute, checkCapability } = useVOPSyTierCapabilities();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstLoginMode, setIsFirstLoginMode] = useState(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Initialize with welcome message (only if not in first-login mode)
  useEffect(() => {
    if (!isFirstLoginMode) {
      const welcomeMsg = WELCOME_MESSAGE(
        user?.name?.split(' ')[0] || 'there',
        currentTier.displayName,
        tierDisplayName
      );
      setMessages([welcomeMsg]);
      messagesRef.current = [welcomeMsg];
    }
  }, [user?.name, currentTier.displayName, tierDisplayName, isFirstLoginMode]);

  // Keep ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Set first login mode (called by VOPSy page when first login is active)
  const setFirstLogin = useCallback((active: boolean) => {
    setIsFirstLoginMode(active);
    if (active) {
      setMessages([]);
      messagesRef.current = [];
    }
  }, []);

  // Check if a message requests a capability beyond the user's tier
  const checkMessageCapability = useCallback((content: string): { blocked: boolean; capability?: VOPSyCapability; message?: string } => {
    const lowerContent = content.toLowerCase();
    
    // Keywords that indicate write/execution requests
    const writeKeywords = ['update', 'modify', 'change', 'edit', 'create', 'add', 'delete', 'remove', 'send', 'execute', 'run', 'automate'];
    const readKeywords = ['show', 'check', 'analyze', 'get', 'fetch', 'view', 'see', 'look'];
    const integrationKeywords = ['inbox', 'email', 'calendar', 'spreadsheet', 'google', 'quickbooks', 'stripe', 'integration'];
    
    const hasWriteIntent = writeKeywords.some(kw => lowerContent.includes(kw));
    const hasReadIntent = readKeywords.some(kw => lowerContent.includes(kw));
    const hasIntegrationContext = integrationKeywords.some(kw => lowerContent.includes(kw));
    
    // Check write/execution capability
    if (hasWriteIntent && hasIntegrationContext && !canExecute) {
      const check = checkCapability('execute_tasks');
      return {
        blocked: true,
        capability: 'execute_tasks',
        message: check.reason,
      };
    }
    
    // Check read capability
    if (hasReadIntent && hasIntegrationContext && !canRead) {
      const check = checkCapability('read_integrations');
      return {
        blocked: true,
        capability: 'read_integrations',
        message: check.reason,
      };
    }
    
    return { blocked: false };
  }, [canRead, canExecute, checkCapability]);

  const sendMessage = useCallback(async (content: string, skipAI: boolean = false) => {
    if (!content.trim() || isLoading) return;

    setError(null);

    // Check for capability limitations
    const capabilityCheck = checkMessageCapability(content);

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
      // Build user context for the AI with tier info
      const userContext: UserContext = {
        userName: user?.name || 'User',
        userTier: currentTier.displayName,
        tierCapabilities: currentTier.capabilities,
        isOwner,
        vopsyTier,
        canRead,
        canWrite,
        canExecute,
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
          capabilityBlocked: capabilityCheck.blocked ? capabilityCheck.capability : undefined,
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
        // Add upgrade nudge if capability was blocked
        showUpgradeNudge: capabilityCheck.blocked,
        suggestedTier: capabilityCheck.blocked ? (canRead ? 'operations' : 'assistant') : undefined,
        capabilityBlocked: capabilityCheck.capability,
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
  }, [isLoading, user?.name, currentTier, isOwner, vopsyTier, canRead, canWrite, canExecute, checkMessageCapability]);

  // Add an assistant message directly (for inbox intelligence, etc.)
  const addAssistantMessage = useCallback((content: string, options?: { showUpgradeNudge?: boolean; suggestedTier?: 'free' | 'assistant' | 'operations' }) => {
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'vopsy',
      content,
      timestamp: new Date(),
      ...options,
    };
    setMessages(prev => [...prev, assistantMessage]);
  }, []);

  const clearHistory = useCallback(() => {
    const welcomeMsg = WELCOME_MESSAGE(
      user?.name?.split(' ')[0] || 'there',
      currentTier.displayName,
      tierDisplayName
    );
    setMessages([welcomeMsg]);
    messagesRef.current = [welcomeMsg];
    setIsFirstLoginMode(false);
  }, [user?.name, currentTier.displayName, tierDisplayName]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    addAssistantMessage,
    setFirstLogin,
    isFirstLoginMode,
    // Tier capabilities for UI
    vopsyTier,
    canRead,
    canWrite,
    canExecute,
  };
}
