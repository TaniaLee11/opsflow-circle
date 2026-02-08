import { motion } from "framer-motion";
import { Sparkles, ArrowRight, RefreshCw, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useVOPSyDailyBriefing } from "@/hooks/useVOPSyDailyBriefing";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function VOPSyBriefing() {
  const { isLoading, briefing, metrics, refresh } = useVOPSyDailyBriefing();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass gradient-border rounded-xl p-4 sm:p-6"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!briefing || !metrics) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass gradient-border rounded-xl p-4 sm:p-6"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm sm:text-base mb-2">
              VOPSy Daily Briefing
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Welcome! Start by creating projects and tasks, or connect your financial tools 
              for personalized insights.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const healthColors = {
    healthy: "text-success",
    attention: "text-warning",
    critical: "text-destructive",
  };

  const healthLabels = {
    healthy: "healthy position",
    attention: "needs attention",
    critical: "action required",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass gradient-border rounded-xl p-4 sm:p-6",
        briefing.healthStatus === 'healthy' && "glow-primary-sm"
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary shrink-0">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              VOPSy Daily Briefing
            </h3>
            <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-primary/20 text-primary">
              Live Data
            </span>
            <button
              onClick={refresh}
              className="ml-auto p-1 rounded-md hover:bg-secondary/50 transition-colors"
              title="Refresh briefing"
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            You're in a{" "}
            <span className={cn("font-medium", healthColors[briefing.healthStatus])}>
              {healthLabels[briefing.healthStatus]}
            </span>{" "}
            today. {briefing.primaryMessage}
          </p>

          {/* Dynamic Alerts */}
          {(briefing.alerts?.length || 0) > 0 && (
            <div className="space-y-2 mb-3 sm:mb-4">
              {briefing.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-2 text-xs sm:text-sm p-2 rounded-lg",
                    alert.type === 'warning' && "bg-warning/10 text-warning",
                    alert.type === 'info' && "bg-info/10 text-info",
                    alert.type === 'success' && "bg-success/10 text-success"
                  )}
                >
                  {alert.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                  {alert.type === 'info' && <Info className="w-3.5 h-3.5 shrink-0" />}
                  {alert.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  <span className="flex-1">
                    <strong>{alert.title}:</strong> {alert.description}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs">
            <div className="px-2 py-1 rounded-md bg-secondary/50">
              <span className="text-muted-foreground">Projects:</span>{" "}
              <span className="font-medium text-foreground">{metrics.activeProjects}</span>
            </div>
            <div className="px-2 py-1 rounded-md bg-secondary/50">
              <span className="text-muted-foreground">Tasks:</span>{" "}
              <span className="font-medium text-foreground">{metrics.totalTasks}</span>
            </div>
            {metrics.completedTasksThisWeek > 0 && (
              <div className="px-2 py-1 rounded-md bg-success/10">
                <span className="text-success">✓ {metrics.completedTasksThisWeek} done this week</span>
              </div>
            )}
            {metrics.financialConnected && metrics.totalBalance > 0 && (
              <div className="px-2 py-1 rounded-md bg-primary/10">
                <span className="text-muted-foreground">Balance:</span>{" "}
                <span className="font-medium text-primary">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(metrics.totalBalance)}
                </span>
              </div>
            )}
          </div>

          <button 
            onClick={() => window.location.href = '/vopsy'}
            className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
          >
            Ask VOPSy to explain more
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
