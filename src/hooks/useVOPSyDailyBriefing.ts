import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BriefingMetrics {
  activeProjects: number;
  totalTasks: number;
  completedTasksThisWeek: number;
  financialConnected: boolean;
  totalBalance: number;
}

export interface DailyBriefing {
  greeting: string;
  healthStatus: 'healthy' | 'attention' | 'critical';
  primaryMessage: string;
  alerts: Array<{
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
    action?: string;
  }>;
  suggestions: string[];
  lastUpdated: Date;
}

export function useVOPSyDailyBriefing() {
  const { user, currentTier } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<BriefingMetrics | null>(null);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch briefing from VOPSy edge function
  const fetchBriefing = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call vopsy-chat edge function with briefing_mode=true
      const { data, error: edgeFunctionError } = await supabase.functions.invoke('vopsy-chat', {
        body: {
          messages: [{
            role: 'user',
            content: 'Generate my daily briefing',
          }],
          user_tier: currentTier || 'free',
          user_id: user.id,
          briefing_mode: true,
        },
      });

      if (edgeFunctionError) throw edgeFunctionError;

      if (!data || !data.briefing) {
        throw new Error('Invalid briefing response from VOPSy');
      }

      // Parse the briefing response
      const briefingData = data.briefing;
      
      // Extract metrics from briefing (simplified - VOPSy provides the analysis)
      const simpleMetrics: BriefingMetrics = {
        activeProjects: 0,
        totalTasks: 0,
        completedTasksThisWeek: 0,
        financialConnected: false,
        totalBalance: 0,
      };

      // Parse VOPSy's directive briefing into our format
      const parsedBriefing: DailyBriefing = {
        greeting: 'Good morning',
        healthStatus: briefingData.priorities?.length > 0 ? 'attention' : 'healthy',
        primaryMessage: data.reply || 'VOPSy is analyzing your operations...',
        alerts: [
          ...(briefingData.priorities || []).map((priority: string, index: number) => ({
            type: 'warning' as const,
            title: `Priority ${index + 1}`,
            description: priority,
          })),
          ...(briefingData.deadlines || []).map((deadline: string) => ({
            type: 'warning' as const,
            title: 'Deadline',
            description: deadline,
          })),
          ...(briefingData.recommendations || []).map((rec: string) => ({
            type: 'info' as const,
            title: 'Recommendation',
            description: rec,
          })),
        ],
        suggestions: briefingData.courses_suggested || [],
        lastUpdated: new Date(),
      };

      setMetrics(simpleMetrics);
      setBriefing(parsedBriefing);
    } catch (err) {
      console.error('Failed to fetch VOPSy briefing:', err);
      setError(err instanceof Error ? err.message : 'Failed to load briefing');
      
      // Fallback briefing
      setBriefing({
        greeting: 'Good morning',
        healthStatus: 'healthy',
        primaryMessage: 'Welcome! VOPSy is ready to help you manage your operations.',
        alerts: [],
        suggestions: ['Connect your tools to get personalized insights'],
        lastUpdated: new Date(),
      });
      setMetrics({
        activeProjects: 0,
        totalTasks: 0,
        completedTasksThisWeek: 0,
        financialConnected: false,
        totalBalance: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentTier]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

  return {
    isLoading,
    briefing,
    metrics,
    error,
    refresh: fetchBriefing,
  };
}
