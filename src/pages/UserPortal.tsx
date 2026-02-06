import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AccessGate } from "@/components/access/AccessGate";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TIERS, UserTierId } from "@/contexts/UserTierContext";
import { useClientView } from "@/contexts/ClientViewContext";
import { useTierPortalData, usePortalUsers } from "@/hooks/useTierMetrics";
import { 
  ArrowLeft,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  MessageSquare,
  Download,
  Filter,
  RefreshCw,
  Loader2,
  BarChart3,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  MapPin,
  FolderLock,
  GraduationCap,
  ExternalLink,
  FileText,
  PieChart,
  LineChart,
  Calendar,
  UserCheck,
  UserX,
  Clock,
  Search,
  Eye,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  Ban,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Component for viewing client Vault/Academy
interface ViewClientButtonProps {
  user: {
    id: string;
    displayName: string | null;
    email: string | null;
    companyName: string | null;
  };
  tierId: string;
  destination: "vault" | "academy";
}

function ViewClientButton({ user, tierId, destination }: ViewClientButtonProps) {
  const navigate = useNavigate();
  const { setViewedClient } = useClientView();
  
  const handleClick = () => {
    setViewedClient({
      id: user.id,
      userId: user.id, // id is already the user_id from PortalUser
      displayName: user.displayName,
      email: user.email,
      companyName: user.companyName,
      tier: tierId
    });
    navigate(`/${destination}`);
  };

  const Icon = destination === "vault" ? FolderLock : GraduationCap;
  const label = destination === "vault" ? "Vault" : "Academy";
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-1.5 text-xs"
      onClick={handleClick}
    >
      <Eye className="w-3 h-3" />
      <Icon className="w-3 h-3" />
      {label}
    </Button>
  );
}

function PortalContent() {
  const { tierId } = useParams<{ tierId: string }>();
  const navigate = useNavigate();
  const { isOwner } = useAuth();
  const [userSearch, setUserSearch] = useState("");
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    userId: string | null;
    action: 'upgrade' | 'downgrade' | 'suspend' | 'remove' | null;
    selectedTier?: string;
  }>({ open: false, userId: null, action: null });

  const handleUserAction = (userId: string, action: 'upgrade' | 'downgrade' | 'suspend' | 'remove') => {
    if (action === 'upgrade' || action === 'downgrade') {
      // Open dialog to select new tier
      setActionDialog({ open: true, userId, action });
    } else {
      // Confirm and execute action
      setActionDialog({ open: true, userId, action });
    }
  };

  const executeUserAction = async () => {
    if (!actionDialog.userId || !actionDialog.action) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const payload: any = {
        action: actionDialog.action,
        userId: actionDialog.userId,
      };

      if (actionDialog.action === 'upgrade' || actionDialog.action === 'downgrade') {
        if (!actionDialog.selectedTier) {
          toast.error("Please select a tier");
          return;
        }
        payload.newTier = actionDialog.selectedTier;
      }

      if (actionDialog.action === 'suspend') {
        payload.action = 'status_change';
        payload.newStatus = 'suspended';
      }

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/manage-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        refetch(); // Refresh user list
        setActionDialog({ open: false, userId: null, action: null });
      } else {
        throw new Error(result.error || "Failed to perform action");
      }
    } catch (error: any) {
      console.error("Error managing user:", error);
      toast.error(error.message || "Failed to perform action");
    }
  };

  const availableTiers = Object.values(USER_TIERS).filter(t => t.id !== validTierId);

  // Validate tier ID
  const validTierId = tierId as UserTierId;
  const tier = USER_TIERS[validTierId];

  const { data, isLoading, error, refetch } = useTierPortalData(validTierId);
  const { data: usersData, isLoading: usersLoading } = usePortalUsers(validTierId);

  if (!tier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Portal Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested user portal does not exist.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Only platform owners can access user portals.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Filter users by search
  const filteredUsers = usersData?.users?.filter(user => {
    if (!userSearch) return true;
    const searchLower = userSearch.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.companyName?.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - No Sidebar in Portal View */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg",
                tier.color
              )}>
                {tier.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{tier.displayName} Portal</h1>
                <p className="text-sm text-muted-foreground">Admin View • Read Only</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Portal Content - Full Width, No Sidebar */}
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-muted-foreground">Loading portal data...</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl border border-destructive/50 bg-destructive/10">
            <p className="text-destructive">Failed to load portal data: {error.message}</p>
          </div>
        ) : (
          <>
            {/* KPI Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className={cn("p-2.5 rounded-lg bg-gradient-to-br w-fit mb-3", tier.color, "text-white")}>
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{data?.userCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className={cn("p-2.5 rounded-lg bg-gradient-to-br w-fit mb-3", tier.color, "text-white")}>
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{data?.activeUsers || 0}</p>
                    <p className="text-xs text-muted-foreground">Active Subscribers</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className={cn("p-2.5 rounded-lg bg-gradient-to-br w-fit mb-3", tier.color, "text-white")}>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">${data?.mrr?.toFixed(2) || "0.00"}</p>
                    <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className={cn("p-2.5 rounded-lg bg-gradient-to-br w-fit mb-3", tier.color, "text-white")}>
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{usersData?.totalConversations || 0}</p>
                    <p className="text-xs text-muted-foreground">Conversations</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className={cn("p-2.5 rounded-lg bg-gradient-to-br w-fit mb-3", tier.color, "text-white")}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{usersData?.totalMessages || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Messages</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className={cn("p-2.5 rounded-lg bg-gradient-to-br w-fit mb-3", tier.color, "text-white")}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {tier.price ? `$${tier.price}` : tier.priceLabel || 'Free'}
                    </p>
                    <p className="text-xs text-muted-foreground">Price Point</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="dashboard" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="reports" className="gap-2">
                  <PieChart className="w-4 h-4" />
                  Reports
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2">
                  <Users className="w-4 h-4" />
                  Users
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Health Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Health Metrics
                      </CardTitle>
                      <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data?.healthMetrics && data.healthMetrics.length > 0 ? (
                        <div className="space-y-5">
                          {data.healthMetrics.map((metric, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">{metric.label}</span>
                                <span className={cn(
                                  "text-sm font-bold",
                                  metric.status === 'good' ? "text-green-500" :
                                  metric.status === 'warning' ? "text-yellow-500" : "text-red-500"
                                )}>
                                  {metric.value}%
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${metric.value}%` }}
                                  transition={{ duration: 0.8, delay: index * 0.1 }}
                                  className={cn(
                                    "h-full rounded-full",
                                    metric.status === 'good' ? "bg-green-500" :
                                    metric.status === 'warning' ? "bg-yellow-500" : "bg-red-500"
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p>No data available yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>Latest user interactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data?.recentActivity && data.recentActivity.length > 0 ? (
                        <div className="space-y-3">
                          {data.recentActivity.slice(0, 5).map((activity, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                              <div className={cn("w-2 h-2 rounded-full bg-gradient-to-br", tier.color)} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{activity.action}</p>
                                <p className="text-xs text-muted-foreground">{activity.user}</p>
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p>No recent activity</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Tier Capabilities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Tier Capabilities
                    </CardTitle>
                    <CardDescription>Features included in {tier.displayName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tier.capabilities.map((cap, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground">{cap}</span>
                        </div>
                      ))}
                    </div>
                    {tier.limitations && tier.limitations.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-foreground mb-3 text-sm">Limitations</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {tier.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                              <UserX className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                              <span className="text-sm text-muted-foreground">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Report */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Revenue Report
                      </CardTitle>
                      <CardDescription>Monthly recurring revenue breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Current MRR</p>
                          <p className="text-xl font-bold text-foreground">${data?.mrr?.toFixed(2) || "0.00"}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Projected ARR</p>
                          <p className="text-xl font-bold text-foreground">${((data?.mrr || 0) * 12).toFixed(2)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Avg Revenue/User</p>
                          <p className="text-xl font-bold text-foreground">
                            ${data?.activeUsers ? ((data?.mrr || 0) / data.activeUsers).toFixed(2) : "0.00"}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Price Point</p>
                          <p className="text-xl font-bold text-foreground">
                            {tier.price ? `$${tier.price}` : tier.priceLabel || 'Free'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Engagement Report */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="w-5 h-5 text-primary" />
                        Engagement Report
                      </CardTitle>
                      <CardDescription>User activity and engagement metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Total Users</p>
                          <p className="text-xl font-bold text-foreground">{data?.userCount || 0}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Active Rate</p>
                          <p className="text-xl font-bold text-foreground">
                            {data?.userCount ? Math.round(((data?.activeUsers || 0) / data.userCount) * 100) : 0}%
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Conversations</p>
                          <p className="text-xl font-bold text-foreground">{usersData?.totalConversations || 0}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Messages</p>
                          <p className="text-xl font-bold text-foreground">{usersData?.totalMessages || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Conversion Report */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      Conversion & Retention
                    </CardTitle>
                    <CardDescription>User lifecycle metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <UserCheck className="w-5 h-5 text-green-500 mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Active Subscribers</p>
                        <p className="text-2xl font-bold text-foreground">{data?.activeUsers || 0}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <Clock className="w-5 h-5 text-yellow-500 mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Pending</p>
                        <p className="text-2xl font-bold text-foreground">{(data?.userCount || 0) - (data?.activeUsers || 0)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Calendar className="w-5 h-5 text-blue-500 mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">This Month</p>
                        <p className="text-2xl font-bold text-foreground">{usersData?.newThisMonth || 0}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <TrendingUp className="w-5 h-5 text-primary mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Growth Rate</p>
                        <p className="text-2xl font-bold text-foreground">
                          {usersData?.growthRate || 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          {tier.displayName} Users
                        </CardTitle>
                        <CardDescription>Detailed client profiles with links to Vault and Academy</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="pl-9 w-64"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        <span className="ml-2 text-muted-foreground">Loading users...</span>
                      </div>
                    ) : filteredUsers.length > 0 ? (
                      <div className="space-y-4">
                        {filteredUsers.map((user, index) => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-4">
                              {/* Avatar */}
                              <div className={cn(
                                "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shrink-0",
                                tier.color
                              )}>
                                {user.displayName?.[0] || user.email?.[0] || "?"}
                              </div>

                              {/* User Info */}
                              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Name & Company */}
                                <div>
                                  <p className="font-semibold text-foreground">{user.displayName || "Unknown"}</p>
                                  {user.companyName && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Building2 className="w-3 h-3" />
                                      {user.companyName}
                                    </p>
                                  )}
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {user.email || "No email"}
                                  </p>
                                  {user.phone && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {user.phone}
                                    </p>
                                  )}
                                </div>

                                {/* Address */}
                                <div>
                                  {user.address ? (
                                    <p className="text-sm text-muted-foreground flex items-start gap-1">
                                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                      <span className="line-clamp-2">{user.address}</span>
                                    </p>
                                  ) : (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      No address on file
                                    </p>
                                  )}
                                </div>

                                {/* Status & Activity */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "px-2 py-0.5 text-xs font-medium rounded-full",
                                      user.subscriptionConfirmed 
                                        ? "bg-green-500/20 text-green-500" 
                                        : "bg-yellow-500/20 text-yellow-500"
                                    )}>
                                      {user.subscriptionConfirmed ? "Active" : "Pending"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {user.messageCount || 0} messages • {user.conversationCount || 0} chats
                                  </p>
                                </div>
                              </div>

                              {/* Quick Links & Actions */}
                              <div className="flex flex-col gap-2 shrink-0">
                                <ViewClientButton 
                                  user={user} 
                                  tierId={validTierId} 
                                  destination="vault" 
                                />
                                <ViewClientButton 
                                  user={user} 
                                  tierId={validTierId} 
                                  destination="academy" 
                                />
                                <div className="h-px bg-border my-1" />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1.5 text-xs text-green-600 hover:text-green-700"
                                  onClick={() => handleUserAction(user.id, 'upgrade')}
                                >
                                  <ArrowUpCircle className="w-3 h-3" />
                                  Upgrade
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1.5 text-xs text-orange-600 hover:text-orange-700"
                                  onClick={() => handleUserAction(user.id, 'downgrade')}
                                >
                                  <ArrowDownCircle className="w-3 h-3" />
                                  Downgrade
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1.5 text-xs text-yellow-600 hover:text-yellow-700"
                                  onClick={() => handleUserAction(user.id, 'suspend')}
                                >
                                  <Ban className="w-3 h-3" />
                                  Suspend
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1.5 text-xs text-red-600 hover:text-red-700"
                                  onClick={() => handleUserAction(user.id, 'remove')}
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>{userSearch ? "No users match your search" : "No users on this tier yet"}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* User Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'upgrade' && 'Upgrade User'}
              {actionDialog.action === 'downgrade' && 'Downgrade User'}
              {actionDialog.action === 'suspend' && 'Suspend User'}
              {actionDialog.action === 'remove' && 'Remove User'}
            </DialogTitle>
            <DialogDescription>
              {(actionDialog.action === 'upgrade' || actionDialog.action === 'downgrade') && (
                <div className="space-y-4 mt-4">
                  <p>Select the new tier for this user:</p>
                  <Select
                    value={actionDialog.selectedTier}
                    onValueChange={(value) => setActionDialog({ ...actionDialog, selectedTier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.displayName} - {tier.price ? `$${tier.price}/mo` : tier.priceLabel || 'Free'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {actionDialog.action === 'suspend' && (
                <p className="mt-4">Are you sure you want to suspend this user? They will lose access to the platform until reactivated.</p>
              )}
              {actionDialog.action === 'remove' && (
                <p className="mt-4 text-destructive font-semibold">⚠️ Are you sure you want to permanently remove this user? This action cannot be undone.</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, userId: null, action: null })}>
              Cancel
            </Button>
            <Button 
              onClick={executeUserAction}
              variant={actionDialog.action === 'remove' ? 'destructive' : 'default'}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UserPortal() {
  return (
    <AccessGate>
      <PortalContent />
    </AccessGate>
  );
}