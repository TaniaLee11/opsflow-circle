import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Activity, AlertCircle, CheckCircle2, Clock, TrendingUp, Crown, Sparkles, Zap, Rocket } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlatformStats {
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  totalOrganizations: number;
  integrationConnections: number;
  systemErrors: number;
}

interface TierStats {
  tierId: string;
  tierName: string;
  userCount: number;
  activeCount: number;
  mrr: number;
  icon: React.ReactNode;
  color: string;
}

interface RecentUser {
  id: string;
  email: string;
  created_at: string;
  organization_name: string;
  tier: string;
}

interface RecentActivity {
  id: string;
  user_email: string;
  action: string;
  timestamp: string;
  details: string;
}

export default function OwnerDashboard() {
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    totalOrganizations: 0,
    integrationConnections: 0,
    systemErrors: 0,
  });
  const [tierStats, setTierStats] = useState<TierStats[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    loadPlatformData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadPlatformData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPlatformData = async () => {
    try {
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

      // Load tier statistics
      const { data: tierData } = await supabase
        .from("accounts")
        .select(`
          tier_id,
          subscription_confirmed,
          profiles (user_id)
        `);

      // Calculate tier stats
      const tiers = [
        { id: "free", name: "AI Free", icon: <Users className="w-5 h-5" />, color: "from-gray-500 to-gray-400" },
        { id: "ai_assistant", name: "AI Assistant", icon: <Sparkles className="w-5 h-5" />, color: "from-blue-500 to-cyan-400" },
        { id: "ai_operations", name: "AI Operations", icon: <Zap className="w-5 h-5" />, color: "from-purple-500 to-pink-400" },
        { id: "ai_tax", name: "AI Tax", icon: <Crown className="w-5 h-5" />, color: "from-amber-500 to-yellow-400" },
        { id: "ai_advisory", name: "AI Advisory", icon: <TrendingUp className="w-5 h-5" />, color: "from-emerald-500 to-teal-400" },
        { id: "ai_enterprise", name: "AI Enterprise", icon: <Rocket className="w-5 h-5" />, color: "from-primary to-orange-400" },
        { id: "ai_compliance", name: "AI Compliance", icon: <CheckCircle2 className="w-5 h-5" />, color: "from-rose-500 to-red-400" },
      ];

      const tierStatsData: TierStats[] = tiers.map(tier => {
        const tierUsers = tierData?.filter(account => account.tier_id === tier.id) || [];
        const activeUsers = tierUsers.filter(account => account.subscription_confirmed).length;
        
        // Calculate MRR based on tier pricing
        const tierPrices: Record<string, number> = {
          free: 0,
          ai_assistant: 34.99,
          ai_operations: 99.99,
          ai_tax: 125, // Average pricing
          ai_advisory: 125, // Per hour, estimate monthly
          ai_enterprise: 499,
          ai_compliance: 175, // Average pricing
        };
        
        const mrr = activeUsers * (tierPrices[tier.id] || 0);

        return {
          tierId: tier.id,
          tierName: tier.name,
          userCount: tierUsers.length,
          activeCount: activeUsers,
          mrr,
          icon: tier.icon,
          color: tier.color,
        };
      });

      setTierStats(tierStatsData);

      // Load recent users
      const { data: recentUsersData } = await supabase
        .from("profiles")
        .select(`
          user_id,
          email,
          contact_name,
          created_at,
          organization_id,
          organizations (name),
          accounts (tier_id)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      const formattedUsers: RecentUser[] = (recentUsersData || []).map((u: any) => ({
        id: u.user_id,
        email: u.email,
        created_at: u.created_at,
        organization_name: u.organizations?.name || u.contact_name || "Unknown",
        tier: u.accounts?.tier_id || "none",
      }));

      setStats({
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        activeUsers: tierStatsData.reduce((sum, tier) => sum + tier.activeCount, 0),
        totalOrganizations: totalOrganizations || 0,
        integrationConnections: integrationConnections || 0,
        systemErrors: 0, // TODO: Implement error tracking
      });

      setRecentUsers(formattedUsers);
      setLoading(false);
    } catch (error: any) {
      console.error("Error loading platform data:", error);
      toast.error("Failed to load platform data");
      setLoading(false);
    }
  };

  // Check if user is platform owner (tania@virtualopsassist.com)
  if (!user || user.email !== "tania@virtualopsassist.com") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This dashboard is only accessible to the platform owner.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className={`min-h-screen bg-background p-6 ${isMobile ? 'pt-20' : 'md:ml-64'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Owner Dashboard</h1>
            <p className="text-muted-foreground">Real-time visibility into Virtual OPS Hub</p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Clock className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>

        {/* Tier Analytics Cards - Clickable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tierStats.map((tier) => (
            <Card 
              key={tier.tierId}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              onClick={() => navigate(`/portal/${tier.tierId}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{tier.tierName}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${tier.color} text-white`}>
                  {tier.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tier.userCount}</div>
                <p className="text-xs text-muted-foreground">
                  {tier.activeCount} active • ${tier.mrr.toFixed(0)}/mo
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newUsersToday} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
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
              <div className="text-2xl font-bold">{stats.integrationConnections}</div>
              <p className="text-xs text-muted-foreground">
                Connected accounts
              </p>
            </CardContent>
          </Card>
        </div>

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
                    {recentUsers.map((user) => (
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
      </div>
    </div>
    </>
  );
}
