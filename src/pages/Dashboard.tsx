import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TaskList } from "@/components/dashboard/TaskList";
import { TeamActivity } from "@/components/dashboard/TeamActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { VOPSyAgent } from "@/components/vopsy/VOPSyAgent";
import { TierSelector } from "@/components/tier/TierSelector";
import { TierMetrics } from "@/components/dashboard/TierMetrics";
import { CohortBanner } from "@/components/tier/CohortBanner";
import { CohortInvitePanel } from "@/components/cohort/CohortInvitePanel";
import { AccessGate } from "@/components/access/AccessGate";
import { VOPSyBriefing } from "@/components/dashboard/VOPSyBriefing";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTier } from "@/contexts/UserTierContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVOPSyDailyBriefing } from "@/hooks/useVOPSyDailyBriefing";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  TrendingUp,
  Calendar,
  ChevronDown,
  Activity,
  AlertCircle,
  Clock,
  Loader2,
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

interface PlatformStats {
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  totalOrganizations: number;
  integrationConnections: number;
  systemErrors: number;
  cohortUsers: number;
  tierDistribution: { tier: string; count: number }[];
}

interface RecentUser {
  id: string;
  email: string;
  created_at: string;
  organization_name: string;
  tier: string;
}

function DashboardContent() {
  const { user, isOwner } = useAuth();
  const { isCohort } = useUserTier();
  const isMobile = useIsMobile();
  const { metrics } = useVOPSyDailyBriefing();
  
  // Owner dashboard state
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    totalOrganizations: 0,
    integrationConnections: 0,
    systemErrors: 0,
    cohortUsers: 0,
    tierDistribution: [],
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  const isOwnerEmail = user?.email === 'tania@virtualopsassist.com';

  // Load platform data for owner
  useEffect(() => {
    if (isOwnerEmail) {
      loadPlatformData();
      const interval = setInterval(loadPlatformData, 30000);
      return () => clearInterval(interval);
    }
  }, [isOwnerEmail]);

  const loadPlatformData = async () => {
    try {
      setOwnerLoading(true);
      
      // Load total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Load new users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: newUsersToday } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      // Load total organizations
      const { count: totalOrganizations } = await supabase
        .from("organizations")
        .select("*", { count: "exact", head: true });

      // Load integration connections
      const { count: integrationConnections } = await supabase
        .from("user_integrations")
        .select("*", { count: "exact", head: true })
        .eq("status", "connected");

      // Load cohort users count
      const { count: cohortUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("selected_tier", "cohort");

      // Load tier distribution
      const { data: tierData } = await supabase
        .from("profiles")
        .select("selected_tier");
      
      // Group by tier and count
      const tierCounts: Record<string, number> = {};
      (tierData || []).forEach((profile: any) => {
        const tier = profile.selected_tier || "free";
        tierCounts[tier] = (tierCounts[tier] || 0) + 1;
      });
      
      const tierDistribution = Object.entries(tierCounts)
        .map(([tier, count]) => ({ tier, count }))
        .sort((a, b) => b.count - a.count);

      // Load recent users
      const { data: recentUsersData } = await supabase
        .from("profiles")
        .select(`
          user_id,
          email,
          contact_name,
          created_at,
          organization_id,
          selected_tier,
          organizations (name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      const formattedUsers: RecentUser[] = (recentUsersData || []).map((u: any) => ({
        id: u.user_id,
        email: u.email,
        created_at: u.created_at,
        organization_name: u.organizations?.name || u.contact_name || "Unknown",
        tier: u.selected_tier || "free",
      }));

      setPlatformStats({
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        activeUsers: 0,
        totalOrganizations: totalOrganizations || 0,
        integrationConnections: integrationConnections || 0,
        systemErrors: 0,
        cohortUsers: cohortUsers || 0,
        tierDistribution,
      });

      setRecentUsers(formattedUsers);
      setOwnerLoading(false);
    } catch (error: any) {
      console.error("Error loading platform data:", error);
      toast.error("Failed to load platform data");
      setOwnerLoading(false);
    }
  };

  const userMessages = userTypeMessages[user?.userType || "entrepreneur"];

  return (
    <div className="min-h-screen bg-background">
      {/* Cohort Banner - shows for cohort users */}
      <CohortBanner />
      
      <Sidebar />
      
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
                  {isOwnerEmail ? "Platform Owner Dashboard" : `Welcome back, ${user?.name?.split(" ")[0]} 👋`}
                </h1>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs sm:text-sm text-muted-foreground mt-0.5"
              >
                {isOwnerEmail ? "Real-time visibility into Virtual OPS Hub" : `${userMessages.greeting} • Focus: `}
                {!isOwnerEmail && <span className="text-primary">{userMessages.focus}</span>}
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 sm:gap-4 flex-wrap"
            >
              {isOwnerEmail && (
                <Badge variant="outline" className="text-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
              {!isOwnerEmail && (
                <>
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
                </>
              )}
            </motion.div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Owner Platform Stats - Only visible to tania@virtualopsassist.com */}
          {isOwnerEmail && (
            <>
              {ownerLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Platform Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{platformStats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                          +{platformStats.newUsersToday} today
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{platformStats.totalOrganizations}</div>
                        <p className="text-xs text-muted-foreground">
                          Active workspaces
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Integrations</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{platformStats.integrationConnections}</div>
                        <p className="text-xs text-muted-foreground">
                          Connected accounts
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Cohort Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-primary">{platformStats.cohortUsers}</div>
                        <p className="text-xs text-muted-foreground">
                          Invite-only members
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* User Tier Distribution Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Tier Distribution</CardTitle>
                      <CardDescription>Breakdown of users across all subscription tiers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {(platformStats.tierDistribution || []).map(({ tier, count }) => (
                          <div key={tier} className="flex flex-col items-center p-4 rounded-lg border border-border bg-secondary/20">
                            <div className="text-2xl font-bold text-foreground">{count}</div>
                            <div className="text-xs text-muted-foreground capitalize mt-1">{tier}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tabs for detailed views */}
                  <Tabs defaultValue="users" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="users">Recent Users</TabsTrigger>
                      <TabsTrigger value="activity">Activity Log</TabsTrigger>
                      <TabsTrigger value="errors">System Errors</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Signups</CardTitle>
                          <CardDescription>Latest users who joined the platform</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-4">
                              {(recentUsers || []).map((user) => (
                                <div
                                  key={user.id}
                                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                                >
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">{user.email}</p>
                                    <p className="text-xs text-muted-foreground">{user.organization_name}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline">{user.tier}</Badge>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(user.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Activity Log</CardTitle>
                          <CardDescription>Recent platform activity and events</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-12 text-muted-foreground">
                            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Activity logging coming soon</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="errors" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>System Errors</CardTitle>
                          <CardDescription>Recent errors and issues requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-12 text-muted-foreground">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No errors detected</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </>
          )}

          {/* Regular User Dashboard Content */}
          {!isOwnerEmail && (
            <>
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
                  <TeamActivity />
                </div>
              </div>
            </>
          )}
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
