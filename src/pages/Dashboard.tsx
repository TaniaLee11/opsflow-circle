import { Sidebar } from "@/components/layout/Sidebar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TaskList } from "@/components/dashboard/TaskList";
import { TeamActivity } from "@/components/dashboard/TeamActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { motion } from "framer-motion";
import { 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  TrendingUp,
  Calendar,
  ChevronDown
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-foreground"
              >
                Welcome back, Tania 👋
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground"
              >
                Here's what's happening with your projects today
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
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
    </div>
  );
};

export default Index;
