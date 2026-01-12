import { Sidebar } from "@/components/layout/Sidebar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TaskList } from "@/components/dashboard/TaskList";
import { TeamActivity } from "@/components/dashboard/TeamActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { VOPSyAgent } from "@/components/vopsy/VOPSyAgent";
import { SubUserSelector } from "@/components/subuser/SubUserSelector";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  TrendingUp,
  Calendar,
  ChevronDown,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

const userTypeMessages = {
  gig_worker: {
    greeting: "Let's keep your hustle healthy",
    focus: "Cash Flow & Tax Prep"
  },
  entrepreneur: {
    greeting: "Here's your operations snapshot",
    focus: "Growth & Profitability"
  },
  nonprofit: {
    greeting: "Mission status at a glance",
    focus: "Compliance & Sustainability"
  }
};

const alerts = [
  {
    id: 1,
    type: "warning",
    title: "Quarterly Tax Payment Due",
    description: "VOPSy calculated: ~$3,200 due in 3 days",
    action: "Let VOPSy Help"
  },
  {
    id: 2,
    type: "info",
    title: "Cash Runway Alert",
    description: "VOPSy estimates 2.8 months at current burn rate",
    action: "See Analysis"
  }
];

export default function Dashboard() {
  const { user, isAuthenticated, isOwner } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const userMessages = userTypeMessages[user?.userType || "entrepreneur"];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, {user?.name?.split(" ")[0]} 👋
                </h1>
                {isOwner && (
                  <span className="px-2 py-1 text-xs font-bold rounded-lg bg-primary/20 text-primary flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Platform Owner
                  </span>
                )}
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground"
              >
                {userMessages.greeting} • Focus: <span className="text-primary">{userMessages.focus}</span>
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <SubUserSelector />
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium">
                <Calendar className="w-4 h-4" />
                <span>Last 7 days</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium glow-primary-sm">
                + New Project
              </button>
            </motion.div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          {/* VOPSy Daily Briefing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass gradient-border rounded-xl p-6 glow-primary-sm"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">VOPSy Daily Briefing</h3>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
                    AI Analysis
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  You're in a <span className="text-success font-medium">healthy position</span> today. 
                  Revenue is up 12% from last week, and your cash runway is stable at 3.2 months. 
                  <span className="text-warning"> However, your Q4 tax payment is due in 3 days</span> — 
                  I recommend setting aside $3,200 today to stay on track.
                </p>
                <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
                  Ask VOPSy to explain more
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-l-4",
                    alert.type === "warning" 
                      ? "bg-warning/10 border-l-warning" 
                      : "bg-info/10 border-l-info"
                  )}
                >
                  <AlertTriangle className={cn(
                    "w-5 h-5 shrink-0",
                    alert.type === "warning" ? "text-warning" : "text-info"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-background/50 text-foreground text-sm font-medium hover:bg-background transition-colors shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    {alert.action}
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Projects"
              value={12}
              change={8.5}
              changeLabel="vs last month"
              icon={FolderKanban}
              delay={0}
            />
            <MetricCard
              title="Team Members"
              value={24}
              change={4}
              changeLabel="new this month"
              icon={Users}
              delay={0.1}
            />
            <MetricCard
              title="Tasks Completed"
              value={156}
              change={12.3}
              changeLabel="this week"
              icon={CheckCircle2}
              delay={0.2}
            />
            <MetricCard
              title="Productivity"
              value="94%"
              change={2.1}
              changeLabel="improvement"
              icon={TrendingUp}
              delay={0.3}
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tasks - Takes 2 columns */}
            <div className="lg:col-span-2">
              <TaskList />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <QuickActions />
              <TeamActivity />
            </div>
          </div>
        </div>
      </main>

      {/* VOPSy Agent */}
      <VOPSyAgent />
    </div>
  );
}
