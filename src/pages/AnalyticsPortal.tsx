/**
 * Analytics Portal - Absolute Environment Isolation
 * 
 * Platform owners can view ANALYTICS ONLY:
 * - Aggregated counts and metrics
 * - Drillable by tier, time, category
 * - User identifiers are MASKED
 * 
 * NEVER shows:
 * - Raw user data
 * - User-generated content
 * - Individual user environments
 * - Private activity details
 */

import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AccessGate } from "@/components/access/AccessGate";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TIERS, UserTierId } from "@/contexts/UserTierContext";
import { useTierAnalytics, usePlatformAnalytics } from "@/hooks/useAnalytics";
import { 
  ArrowLeft,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  MessageSquare,
  Download,
  RefreshCw,
  Loader2,
  BarChart3,
  CheckCircle2,
  XCircle,
  PieChart,
  Clock,
  Shield,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function AnalyticsPortalContent() {
  const { tierId } = useParams<{ tierId: string }>();
  const navigate = useNavigate();
  const { isOwner } = useAuth();

  const validTierId = tierId as UserTierId;
  const tier = USER_TIERS[validTierId];

  const { data, isLoading, error, refetch } = useTierAnalytics(validTierId);
  const { data: platformData } = usePlatformAnalytics();

  if (!tier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Analytics Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested tier analytics do not exist.</p>
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
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Analytics portals are only accessible to platform owners.</p>
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
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
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
                <h1 className="text-xl font-bold text-foreground">{tier.displayName} Analytics</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Aggregated Metrics Only • No User Data Exposed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

      {/* Content */}
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Privacy Notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Environment Isolation Active</p>
            <p className="text-sm text-muted-foreground">
              You are viewing aggregated analytics only. Individual user data, content, and environments 
              are protected and not accessible from this view.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-muted-foreground">Loading analytics...</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl border border-destructive/50 bg-destructive/10">
            <p className="text-destructive">Failed to load analytics: {error.message}</p>
          </div>
        ) : (
          <>
            {/* Summary Cards - COUNTS ONLY */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className={cn("p-2.5 rounded-lg bg-gradient-to-br w-fit mb-3", tier.color, "text-white")}>
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold">{data?.summary.userCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className={cn("p-2.5 rounded-lg bg-gradient-to-br w-fit mb-3", tier.color, "text-white")}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold">{data?.summary.activeUsers || 0}</p>
                    <p className="text-xs text-muted-foreground">Active Subscribers</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className={cn("p-2.5 rounded-lg bg-gradient-to-br w-fit mb-3", tier.color, "text-white")}>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold">${data?.summary.mrr?.toFixed(2) || "0.00"}</p>
                    <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className={cn("p-2.5 rounded-lg bg-gradient-to-br w-fit mb-3", tier.color, "text-white")}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold">{data?.summary.activationRate || 0}%</p>
                    <p className="text-xs text-muted-foreground">Activation Rate</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="overview" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="drill-down" className="gap-2">
                  <PieChart className="w-4 h-4" />
                  User Metrics
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
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
                      <div className="space-y-5">
                        {data?.healthMetrics.map((metric, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{metric.label}</span>
                              <span className={cn(
                                "text-sm font-bold",
                                metric.status === 'good' ? "text-primary" :
                                metric.status === 'warning' ? "text-accent-foreground" : "text-destructive"
                              )}>
                                {metric.value}%
                              </span>
                            </div>
                            <Progress 
                              value={metric.value} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Activity Summary
                      </CardTitle>
                      <CardDescription>Aggregated usage counts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Total Conversations</span>
                          <span className="font-bold">{data?.summary.conversationCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Total Messages</span>
                          <span className="font-bold">{data?.summary.messageCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Connected Integrations</span>
                          <span className="font-bold">{data?.summary.integrationCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Engagement Score</span>
                          <span className="font-bold">{data?.summary.engagementScore || 0}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* User Metrics Tab - MASKED IDENTIFIERS ONLY */}
              <TabsContent value="drill-down" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      User Activity Metrics
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" />
                      Users are identified by masked IDs only - no personal data exposed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Identifier</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Messages</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Conversations</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Integrations</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.userAnalytics.slice(0, 20).map((user, index) => (
                            <tr key={user.userId} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-3 px-4">
                                <span className="font-mono text-sm">{user.displayIdentifier}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {user.isActive ? (
                                  <span className="inline-flex items-center gap-1 text-primary text-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-medium">{user.messageCount}</td>
                              <td className="py-3 px-4 text-right font-medium">{user.conversationCount}</td>
                              <td className="py-3 px-4 text-right font-medium">{user.integrationCount}</td>
                              <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                                {new Date(user.joinedDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {(data?.userAnalytics.length || 0) > 20 && (
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        Showing top 20 of {data?.userAnalytics.length} users by activity
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsPortal() {
  return (
    <AccessGate requiredAccess={["owner"]}>
      <AnalyticsPortalContent />
    </AccessGate>
  );
}
