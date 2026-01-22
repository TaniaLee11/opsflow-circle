import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type FirstLoginOption = 'scattered' | 'disconnected' | 'overwhelming' | 'unsure';

export interface VOPSyInitializationState {
  isInitialized: boolean;
  isLoading: boolean;
  showFirstLogin: boolean;
  hasCompletedFirstLogin: boolean;
  selectedOption: FirstLoginOption | null;
  showActionMode: boolean;
}

/**
 * Hook to manage VOPSy's one-time first-login interaction.
 * 
 * This interaction runs EXACTLY ONCE per user on their first login.
 * It NEVER repeats regardless of:
 * - tier changes
 * - role changes
 * - cohort status
 * - page reloads
 * - auth refresh
 * - routing changes
 * - system recycling/rehydration
 */
export function useVOPSyInitialization() {
  const { user, session, isLoading: authLoading } = useAuth();
  
  const [state, setState] = useState<VOPSyInitializationState>({
    isInitialized: true, // Default to true to prevent flash
    isLoading: true,
    showFirstLogin: false,
    hasCompletedFirstLogin: false,
    selectedOption: null,
    showActionMode: false,
  });

  // Prevent double-firing with refs
  const hasCheckedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  // Check initialization status from database
  const checkInitialization = useCallback(async () => {
    if (!user?.id || !session) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Prevent duplicate checks for the same session
    const currentSessionId = session.access_token?.slice(-10) || '';
    if (hasCheckedRef.current && sessionIdRef.current === currentSessionId) {
      return;
    }

    hasCheckedRef.current = true;
    sessionIdRef.current = currentSessionId;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('vopsy_initialized')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[VOPSy Init] Error checking initialization:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isInitialized: true, // Fail safe - don't show if error
          showFirstLogin: false 
        }));
        return;
      }

      const isInitialized = data?.vopsy_initialized === true;

      setState(prev => ({
        ...prev,
        isInitialized,
        isLoading: false,
        showFirstLogin: !isInitialized,
        hasCompletedFirstLogin: isInitialized,
      }));
    } catch (err) {
      console.error('[VOPSy Init] Unexpected error:', err);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isInitialized: true,
        showFirstLogin: false 
      }));
    }
  }, [user?.id, session]);

  // Mark as initialized in database
  const markAsInitialized = useCallback(async () => {
    if (!user?.id || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ vopsy_initialized: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('[VOPSy Init] Error marking as initialized:', error);
        return;
      }

      setState(prev => ({
        ...prev,
        isInitialized: true,
        showFirstLogin: false,
        hasCompletedFirstLogin: true,
      }));
    } catch (err) {
      console.error('[VOPSy Init] Unexpected error:', err);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [user?.id]);

  // Handle option selection - immediately show action mode
  const selectOption = useCallback((option: FirstLoginOption) => {
    setState(prev => ({
      ...prev,
      selectedOption: option,
      showActionMode: true,
    }));
  }, []);

  // Complete the first login interaction
  const completeFirstLogin = useCallback(async () => {
    await markAsInitialized();
  }, [markAsInitialized]);

  // Check on mount and when auth changes
  useEffect(() => {
    if (!authLoading && user?.id && session) {
      checkInitialization();
    }
  }, [authLoading, user?.id, session, checkInitialization]);

  // Reset check ref when user changes
  useEffect(() => {
    if (!user?.id) {
      hasCheckedRef.current = false;
      sessionIdRef.current = null;
    }
  }, [user?.id]);

  return {
    ...state,
    selectOption,
    completeFirstLogin,
    checkInitialization,
  };
}
