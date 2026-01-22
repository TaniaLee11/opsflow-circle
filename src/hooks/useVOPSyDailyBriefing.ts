import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BriefingMetrics {
  // Tasks & Projects
  activeProjects: number;
  totalTasks: number;
  completedTasksThisWeek: number;
  overdueTasks: number;
  urgentTasks: number;
  upcomingDeadlines: Array<{
    title: string;
    dueDate: string;
    type: 'task' | 'project';
    priority?: string;
  }>;
  
  // Financial (if connected)
  financialConnected: boolean;
  totalBalance: number;
  monthlyIncome: number;
  overdueInvoices: number;
  pendingReceivables: number;
  cashRunwayMonths: number | null;
  
  // Integrations status
  connectedIntegrations: string[];
  integrationsNeedingAttention: string[];
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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<BriefingMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch all metrics from database
  const fetchMetrics = useCallback(async (): Promise<BriefingMetrics | null> => {
    if (!user?.id) return null;

    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Parallel fetch all data sources
      const [
        tasksResult,
        projectsResult,
        integrationsResult,
        financialResult,
      ] = await Promise.all([
        // Fetch tasks
        supabase
          .from('tasks')
          .select('id, title, status, priority, due_date, completed_at, created_at')
          .order('due_date', { ascending: true }),
        
        // Fetch projects
        supabase
          .from('projects')
          .select('id, name, status, due_date')
          .eq('status', 'active'),
        
        // Fetch integrations
        supabase
          .from('integrations')
          .select('provider, health, last_synced_at'),
        
        // Fetch financial data via edge function (non-blocking)
        supabase.functions.invoke('financial-fetch', {}).catch(() => ({ data: null })),
      ]);

      const tasks = tasksResult.data || [];
      const projects = projectsResult.data || [];
      const integrations = integrationsResult.data || [];

      // Calculate task metrics
      const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress');
      const completedThisWeek = tasks.filter(t => 
        t.status === 'completed' && 
        t.completed_at && 
        new Date(t.completed_at) >= weekAgo
      );
      const overdueTasks = pendingTasks.filter(t => 
        t.due_date && new Date(t.due_date) < now
      );
      const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');

      // Get upcoming deadlines (next 7 days)
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines: BriefingMetrics['upcomingDeadlines'] = [];
      
      // Add task deadlines
      pendingTasks
        .filter(t => t.due_date && new Date(t.due_date) >= now && new Date(t.due_date) <= nextWeek)
        .slice(0, 5)
        .forEach(t => {
          upcomingDeadlines.push({
            title: t.title,
            dueDate: t.due_date!,
            type: 'task',
            priority: t.priority,
          });
        });

      // Add project deadlines
      projects
        .filter(p => p.due_date && new Date(p.due_date) >= now && new Date(p.due_date) <= nextWeek)
        .slice(0, 3)
        .forEach(p => {
          upcomingDeadlines.push({
            title: p.name,
            dueDate: p.due_date!,
            type: 'project',
          });
        });

      // Sort by due date
      upcomingDeadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      // Process financial data
      let financialConnected = false;
      let totalBalance = 0;
      let monthlyIncome = 0;
      let overdueInvoices = 0;
      let pendingReceivables = 0;
      let cashRunwayMonths: number | null = null;

      if (financialResult.data?.connected && financialResult.data?.data) {
        financialConnected = true;
        const financialData = financialResult.data.data as any[];
        
        for (const provider of financialData) {
          if (provider.error) continue;
          
          if (provider.cashFlow) {
            totalBalance += provider.cashFlow.balance || 0;
            monthlyIncome += provider.cashFlow.income || 0;
          }
          
          if (provider.metrics) {
            overdueInvoices += provider.metrics.overdueCount || 0;
            pendingReceivables += provider.metrics.totalReceivable || 0;
          }
        }

        // Calculate cash runway (months of runway based on expenses vs balance)
        const avgMonthlyExpenses = financialData.reduce((sum, p) => 
          sum + (p.cashFlow?.expenses || 0), 0
        );
        if (avgMonthlyExpenses > 0 && totalBalance > 0) {
          cashRunwayMonths = Math.round((totalBalance / avgMonthlyExpenses) * 10) / 10;
        }
      }

      // Process integrations
      const connectedIntegrations = integrations.map(i => i.provider);
      const integrationsNeedingAttention = integrations
        .filter(i => i.health === 'unhealthy' || i.health === 'error')
        .map(i => i.provider);

      const briefingMetrics: BriefingMetrics = {
        activeProjects: projects.length,
        totalTasks: pendingTasks.length,
        completedTasksThisWeek: completedThisWeek.length,
        overdueTasks: overdueTasks.length,
        urgentTasks: urgentTasks.length,
        upcomingDeadlines,
        financialConnected,
        totalBalance,
        monthlyIncome,
        overdueInvoices,
        pendingReceivables,
        cashRunwayMonths,
        connectedIntegrations,
        integrationsNeedingAttention,
      };

      setMetrics(briefingMetrics);
      return briefingMetrics;
    } catch (err) {
      console.error('Failed to fetch briefing metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load briefing');
      return null;
    }
  }, [user?.id]);

  // Generate the daily briefing from metrics
  const briefing = useMemo((): DailyBriefing | null => {
    if (!metrics) return null;

    const alerts: DailyBriefing['alerts'] = [];
    const suggestions: string[] = [];
    let healthStatus: DailyBriefing['healthStatus'] = 'healthy';

    // Determine health status and generate alerts
    
    // Check overdue tasks
    if (metrics.overdueTasks > 0) {
      healthStatus = metrics.overdueTasks >= 3 ? 'critical' : 'attention';
      alerts.push({
        type: 'warning',
        title: `${metrics.overdueTasks} Overdue Task${metrics.overdueTasks > 1 ? 's' : ''}`,
        description: `You have ${metrics.overdueTasks} task${metrics.overdueTasks > 1 ? 's' : ''} past due date`,
        action: 'View Tasks',
      });
    }

    // Check urgent tasks
    if (metrics.urgentTasks > 0) {
      alerts.push({
        type: 'warning',
        title: `${metrics.urgentTasks} High Priority Task${metrics.urgentTasks > 1 ? 's' : ''}`,
        description: `${metrics.urgentTasks} task${metrics.urgentTasks > 1 ? 's require' : ' requires'} immediate attention`,
        action: 'View Tasks',
      });
    }

    // Check overdue invoices
    if (metrics.financialConnected && metrics.overdueInvoices > 0) {
      healthStatus = 'attention';
      alerts.push({
        type: 'warning',
        title: `${metrics.overdueInvoices} Overdue Invoice${metrics.overdueInvoices > 1 ? 's' : ''}`,
        description: `${formatCurrency(metrics.pendingReceivables)} in pending receivables`,
        action: 'View Financial Hub',
      });
    }

    // Check cash runway
    if (metrics.financialConnected && metrics.cashRunwayMonths !== null && metrics.cashRunwayMonths < 3) {
      healthStatus = metrics.cashRunwayMonths < 1.5 ? 'critical' : 'attention';
      alerts.push({
        type: metrics.cashRunwayMonths < 1.5 ? 'warning' : 'info',
        title: 'Cash Runway Alert',
        description: `VOPSy estimates ${metrics.cashRunwayMonths} months at current burn rate`,
        action: 'See Analysis',
      });
    }

    // Check integrations health
    if (metrics.integrationsNeedingAttention.length > 0) {
      alerts.push({
        type: 'info',
        title: 'Integration Needs Attention',
        description: `${metrics.integrationsNeedingAttention.join(', ')} may need reconnection`,
        action: 'Check Integrations',
      });
    }

    // Positive alerts
    if (metrics.completedTasksThisWeek > 0 && alerts.length === 0) {
      alerts.push({
        type: 'success',
        title: `${metrics.completedTasksThisWeek} Tasks Completed`,
        description: 'Great progress this week!',
      });
    }

    // Generate suggestions
    if (!metrics.financialConnected) {
      suggestions.push('Connect your financial tools for cash flow insights');
    }
    if (metrics.activeProjects === 0) {
      suggestions.push('Create a project to organize your work');
    }
    if (metrics.totalTasks === 0) {
      suggestions.push('Add your first task to get started');
    }
    if (metrics.upcomingDeadlines.length > 0) {
      const nextDeadline = metrics.upcomingDeadlines[0];
      const daysUntil = Math.ceil((new Date(nextDeadline.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      suggestions.push(`"${nextDeadline.title}" is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`);
    }

    // Generate primary message
    let primaryMessage = '';
    
    if (healthStatus === 'healthy') {
      if (metrics.financialConnected && metrics.totalBalance > 0) {
        primaryMessage = `You're in a healthy position today. `;
        if (metrics.monthlyIncome > 0) {
          primaryMessage += `This month's income is ${formatCurrency(metrics.monthlyIncome)}`;
          if (metrics.cashRunwayMonths) {
            primaryMessage += ` and your cash runway is stable at ${metrics.cashRunwayMonths} months. `;
          } else {
            primaryMessage += '. ';
          }
        }
        if (metrics.completedTasksThisWeek > 0) {
          primaryMessage += `You've completed ${metrics.completedTasksThisWeek} task${metrics.completedTasksThisWeek > 1 ? 's' : ''} this week.`;
        }
      } else if (metrics.completedTasksThisWeek > 0) {
        primaryMessage = `Good progress! You've completed ${metrics.completedTasksThisWeek} task${metrics.completedTasksThisWeek > 1 ? 's' : ''} this week. `;
        if (metrics.totalTasks > 0) {
          primaryMessage += `${metrics.totalTasks} task${metrics.totalTasks > 1 ? 's' : ''} remaining.`;
        }
      } else {
        primaryMessage = `You have ${metrics.activeProjects} active project${metrics.activeProjects !== 1 ? 's' : ''} and ${metrics.totalTasks} pending task${metrics.totalTasks !== 1 ? 's' : ''}.`;
      }
    } else if (healthStatus === 'attention') {
      primaryMessage = 'A few items need your attention today. ';
      if (metrics.overdueTasks > 0) {
        primaryMessage += `${metrics.overdueTasks} task${metrics.overdueTasks > 1 ? 's are' : ' is'} overdue. `;
      }
      if (metrics.overdueInvoices > 0) {
        primaryMessage += `${metrics.overdueInvoices} invoice${metrics.overdueInvoices > 1 ? 's are' : ' is'} past due.`;
      }
    } else {
      primaryMessage = 'Immediate attention needed. ';
      if (metrics.overdueTasks >= 3) {
        primaryMessage += `You have ${metrics.overdueTasks} overdue tasks. `;
      }
      if (metrics.cashRunwayMonths !== null && metrics.cashRunwayMonths < 1.5) {
        primaryMessage += `Cash runway is critically low at ${metrics.cashRunwayMonths} months.`;
      }
    }

    // Generate greeting based on time of day
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';

    return {
      greeting,
      healthStatus,
      primaryMessage,
      alerts: alerts.slice(0, 3), // Max 3 alerts
      suggestions: suggestions.slice(0, 2), // Max 2 suggestions
      lastUpdated: new Date(),
    };
  }, [metrics]);

  // Auto-fetch on mount
  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      fetchMetrics().finally(() => setIsLoading(false));
    }
  }, [user?.id, fetchMetrics]);

  // Refresh function
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchMetrics();
    setIsLoading(false);
  }, [fetchMetrics]);

  return {
    isLoading,
    metrics,
    briefing,
    error,
    refresh,
  };
}

// Helper
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
