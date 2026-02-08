import { motion } from "framer-motion";
import { AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVOPSyDailyBriefing } from "@/hooks/useVOPSyDailyBriefing";

export function DashboardAlerts() {
  const { briefing, metrics } = useVOPSyDailyBriefing();

  // Generate dynamic alerts based on real data
  const alerts: Array<{
    id: string;
    type: 'warning' | 'info';
    title: string;
    description: string;
    action: string;
    href: string;
  }> = [];

  if (metrics) {
    // Overdue tasks alert
    if (metrics.overdueTasks > 0) {
      alerts.push({
        id: 'overdue-tasks',
        type: 'warning',
        title: `${metrics.overdueTasks} Overdue Task${metrics.overdueTasks > 1 ? 's' : ''}`,
        description: `VOPSy recommends addressing ${metrics.overdueTasks === 1 ? 'this task' : 'these tasks'} today`,
        action: 'View Tasks',
        href: '/workflows',
      });
    }

    // Urgent tasks alert
    if (metrics.urgentTasks > 0 && metrics.overdueTasks === 0) {
      alerts.push({
        id: 'urgent-tasks',
        type: 'warning',
        title: `${metrics.urgentTasks} High Priority Task${metrics.urgentTasks > 1 ? 's' : ''}`,
        description: `${metrics.urgentTasks} task${metrics.urgentTasks > 1 ? 's require' : ' requires'} immediate attention`,
        action: 'View Tasks',
        href: '/workflows',
      });
    }

    // Overdue invoices alert
    if (metrics.financialConnected && metrics.overdueInvoices > 0) {
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(metrics.pendingReceivables);
      
      alerts.push({
        id: 'overdue-invoices',
        type: 'warning',
        title: `${metrics.overdueInvoices} Overdue Invoice${metrics.overdueInvoices > 1 ? 's' : ''}`,
        description: `VOPSy detected ${formattedAmount} in pending receivables`,
        action: 'View Financial Hub',
        href: '/financial-hub',
      });
    }

    // Cash runway alert
    if (metrics.financialConnected && metrics.cashRunwayMonths !== null && metrics.cashRunwayMonths < 3) {
      alerts.push({
        id: 'cash-runway',
        type: metrics.cashRunwayMonths < 1.5 ? 'warning' : 'info',
        title: 'Cash Runway Alert',
        description: `VOPSy estimates ${metrics.cashRunwayMonths} months at current burn rate`,
        action: 'See Analysis',
        href: '/financial-hub',
      });
    }

    // Integration health alerts
    if ((metrics.integrationsNeedingAttention?.length || 0) > 0) {
      alerts.push({
        id: 'integrations',
        type: 'info',
        title: 'Integration Needs Attention',
        description: `${metrics.integrationsNeedingAttention.join(', ')} may need reconnection`,
        action: 'Check Integrations',
        href: '/integrations',
      });
    }

    // Upcoming deadline alert (if no warnings)
    if (alerts.length === 0 && (metrics.upcomingDeadlines?.length || 0) > 0) {
      const nextDeadline = metrics.upcomingDeadlines[0];
      const daysUntil = Math.ceil(
        (new Date(nextDeadline.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntil <= 3) {
        alerts.push({
          id: 'upcoming-deadline',
          type: 'info',
          title: `Deadline in ${daysUntil} Day${daysUntil !== 1 ? 's' : ''}`,
          description: `"${nextDeadline.title}" is due ${daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`}`,
          action: 'View Details',
          href: '/workflows',
        });
      }
    }
  }

  // Show max 2 alerts
  const displayAlerts = alerts.slice(0, 2);

  if ((displayAlerts?.length || 0) === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {displayAlerts.map((alert, index) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index }}
          className={cn(
            "flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-l-4",
            alert.type === "warning" 
              ? "bg-warning/10 border-l-warning" 
              : "bg-info/10 border-l-info"
          )}
        >
          <AlertTriangle className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 sm:mt-0",
            alert.type === "warning" ? "text-warning" : "text-info"
          )} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm sm:text-base">{alert.title}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{alert.description}</p>
          </div>
          <button 
            onClick={() => window.location.href = alert.href}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-background/50 text-foreground text-xs sm:text-sm font-medium hover:bg-background transition-colors shrink-0 flex items-center gap-1"
          >
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
            <span className="hidden sm:inline">{alert.action}</span>
            <span className="sm:hidden">View</span>
          </button>
        </motion.div>
      ))}
    </div>
  );
}
