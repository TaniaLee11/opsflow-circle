import { AppSidebar } from "@/components/layout/AppSidebar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TaskList } from "@/components/dashboard/TaskList";

import { QuickActions } from "@/components/dashboard/QuickActions";
import { VOPSyAgent } from "@/components/vopsy/VOPSyAgent";
import { TierSelector } from "@/components/tier/TierSelector";
import { TierMetrics } from "@/components/dashboard/TierMetrics";
import { CohortBanner } from "@/components/tier/CohortBanner";
import { CohortInvitePanel } from "@/components/cohort/CohortInvitePanel";
import { AccessGate } from "@/components/access/AccessGate";
import { VOPSyBriefing } from "@/components/dashboard/VOPSyBriefing";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTier } from "@/contexts/UserTierContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVOPSyDailyBriefing } from "@/hooks/useVOPSyDailyBriefing";
import { motion } from "framer-motion";
import { 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  TrendingUp,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const userTypeMessages = {
  contractor: {
    greeting: "Let's keep your hustle healthy",
    focus: "Cash Flow & Tax Prep"
  },
  consultant: {
    greeting: "Here's your operations snapshot",
    focus: "Growth & Profitability"
  },
  nonprofit: {
    greeting: "Mission status at a glance",
    focus: "Compliance & Sustainability"
  }
};

function DashboardContent() {
  const { user, isOwner } = useAuth();
  const { isCohort } = useUserTier();
  const isMobile = useIsMobile();
  const { metrics } = useVOPSyDailyBriefing();

  const userMessages = userTypeMessages[user?.userType || "consultant"];

  return (
    <div className="min-h-screen bg-background">
      {/* Cohort Banner - shows for cohort users */}
      <CohortBanner />
      
      <AppSidebar />
      
        {/* Main Content */}
        <main className={cn(
          "min-h-screen transition-all duration-300",
          isMobile ? "pt-14" : "md:ml-64"
        )}>
        {/* Header */}
        <header className="sticky top-0 lg:top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  Welcome back, {user?.name?.split(" ")[0]} 👋
                </h1>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs sm:text-sm text-muted-foreground mt-0.5"
              >
                {userMessages.greeting} • Focus: <span className="text-primary">{userMessages.focus}</span>
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 sm:gap-4 flex-wrap"
            >
              <TierSelector />
              <button 
                onClick={() => window.location.href = '/workflows?tab=calendar'}
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-xs sm:text-sm font-medium"
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">Last 7 days</span>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button 
                onClick={() => window.location.href = '/workflows'}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium glow-primary-sm"
              >
                + New Project
              </button>
            </motion.div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* VOPSy Daily Briefing - Dynamic */}
          <VOPSyBriefing />

          {/* Owner Section: Tier Metrics + Cohort Invites */}
          {isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Cohort Invite Panel */}
              <CohortInvitePanel />
              
              {/* Tier Metrics */}
              <TierMetrics />
            </motion.div>
          )}

          {/* Dynamic Alerts */}
          <DashboardAlerts />

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <MetricCard
              title="Active Projects"
              value={metrics?.activeProjects ?? 0}
              change={0}
              changeLabel="current"
              icon={FolderKanban}
              delay={0}
            />
            <MetricCard
              title="Pending Tasks"
              value={metrics?.totalTasks ?? 0}
              change={metrics?.urgentTasks ?? 0}
              changeLabel="high priority"
              icon={Users}
              delay={0.1}
            />
            <MetricCard
              title="Completed This Week"
              value={metrics?.completedTasksThisWeek ?? 0}
              change={0}
              changeLabel="tasks done"
              icon={CheckCircle2}
              delay={0.2}
            />
            <MetricCard
              title="Overdue"
              value={metrics?.overdueTasks ?? 0}
              change={0}
              changeLabel={metrics?.overdueTasks === 0 ? "all clear" : "needs attention"}
              icon={TrendingUp}
              delay={0.3}
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Tasks - Takes 2 columns */}
            <div className="lg:col-span-2">
              <TaskList />
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              <QuickActions />

            </div>
          </div>
        </div>
      </main>

      {/* VOPSy Agent */}
      <VOPSyAgent />
    </div>
  );
}

export default function Dashboard() {
  return (
    <AccessGate>
      <DashboardContent />
    </AccessGate>
  );
}
