import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TIERS, UserTierId } from "@/contexts/UserTierContext";
import { useTierPortalData } from "@/hooks/useTierMetrics";
import { 
  ArrowLeft,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  MessageSquare,
  Bell,
  Settings,
  Download,
  Filter,
  RefreshCw,
  Loader2,
  BarChart3,
  CheckCircle2,
  Zap,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function PortalContent() {
  const { tierId } = useParams<{ tierId: string }>();
  const navigate = useNavigate();
  const { isOwner } = useAuth();

  // Validate tier ID
  const validTierId = tierId as UserTierId;
  const tier = USER_TIERS[validTierId];

  const { data, isLoading, error, refetch } = useTierPortalData(validTierId);

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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
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
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
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
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Portal Content */}
        <div className="p-8 space-y-8">
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
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                >
                  <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className={cn("p-3 rounded-xl bg-gradient-to-br", tier.color, "text-white")}>
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold text-foreground">{data?.userCount || 0}</p>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className={cn("p-3 rounded-xl bg-gradient-to-br", tier.color, "text-white")}>
                          <Activity className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold text-foreground">{data?.activeUsers || 0}</p>
                        <p className="text-sm text-muted-foreground">Active Subscribers</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className={cn("p-3 rounded-xl bg-gradient-to-br", tier.color, "text-white")}>
                          <DollarSign className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold text-foreground">
                          ${data?.mrr?.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className={cn("p-3 rounded-xl bg-gradient-to-br", tier.color, "text-white")}>
                          <MessageSquare className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold text-foreground">
                          {tier.price ? `$${tier.price}` : tier.priceLabel || 'Free'}
                        </p>
                        <p className="text-sm text-muted-foreground">Price Point</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Main Content Tabs */}
              <Tabs defaultValue="activity" className="space-y-6">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="health">Health Metrics</TabsTrigger>
                  <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>Real-time activity from {tier.displayName} users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data?.recentActivity && data.recentActivity.length > 0 ? (
                        <div className="space-y-4">
                          {data.recentActivity.map((activity, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className={cn("w-2 h-2 rounded-full bg-gradient-to-br", tier.color)} />
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{activity.action}</p>
                                <p className="text-sm text-muted-foreground">{activity.user}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">{activity.time}</span>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p>No recent activity for this tier</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Users
                      </CardTitle>
                      <CardDescription>{tier.displayName} subscribers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data?.topUsers && data.topUsers.length > 0 ? (
                        <div className="space-y-4">
                          {data.topUsers.map((user, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold",
                                tier.color
                              )}>
                                {user.name[0]}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-foreground">{user.activity}</p>
                                {user.revenue && (
                                  <p className="text-xs text-green-500">{user.revenue}</p>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p>No users on this tier yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Health Metrics
                      </CardTitle>
                      <CardDescription>Key performance indicators for {tier.displayName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data?.healthMetrics && data.healthMetrics.length > 0 ? (
                        <div className="space-y-6">
                          {data.healthMetrics.map((metric, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="space-y-2"
                            >
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
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p>No data available yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="capabilities" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Tier Capabilities
                      </CardTitle>
                      <CardDescription>Features included in {tier.displayName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tier.capabilities.map((cap, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/20">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-foreground">{cap}</span>
                          </div>
                        ))}
                      </div>
                      
                      {tier.limitations && tier.limitations.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-foreground mb-3">Limitations</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {tier.limitations.map((limitation, index) => (
                              <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/10">
                                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span className="text-sm text-muted-foreground">{limitation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Status Banner */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Tier Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(data?.userCount || 0) > 0 ? (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 text-green-500 mb-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-medium">Active Tier</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {data?.userCount} user(s) on this tier
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">No Users Yet</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No users have subscribed to this tier
                        </p>
                      </div>
                    )}
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Zap className="w-4 h-4" />
                        <span className="font-medium">Features</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tier.capabilities.length} capabilities included
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">Pricing</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tier.price ? `$${tier.price}/month` : tier.priceLabel || 'Free tier'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
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
