import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TIERS, UserTierId } from "@/contexts/UserTierContext";
import { 
  ArrowLeft,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  FileText,
  Calendar,
  Target,
  Clock,
  BarChart3,
  UserPlus,
  Repeat,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Zap,
  MessageSquare,
  Bell,
  Settings,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Comprehensive portal data for each tier
const portalData: Record<UserTierId, {
  overview: { label: string; value: string; change?: number; icon: React.ReactNode }[];
  recentActivity: { action: string; user: string; time: string }[];
  topUsers: { name: string; email: string; activity: string; revenue?: string }[];
  healthMetrics: { label: string; value: number; status: 'good' | 'warning' | 'critical' }[];
}> = {
  free: {
    overview: [
      { label: "Active Users", value: "1,247", change: 12.5, icon: <Users className="w-5 h-5" /> },
      { label: "Vault Documents", value: "8,432", change: 8.3, icon: <FileText className="w-5 h-5" /> },
      { label: "Plan Completions", value: "341", change: 15.2, icon: <Target className="w-5 h-5" /> },
      { label: "Conversion Rate", value: "4.8%", change: 0.6, icon: <ArrowUpRight className="w-5 h-5" /> },
    ],
    recentActivity: [
      { action: "Completed business plan", user: "Sarah M.", time: "2 min ago" },
      { action: "Uploaded tax documents", user: "Mike R.", time: "5 min ago" },
      { action: "Started learning path", user: "Jennifer L.", time: "12 min ago" },
      { action: "Exported financial report", user: "David K.", time: "18 min ago" },
    ],
    topUsers: [
      { name: "Sarah Mitchell", email: "sarah@example.com", activity: "142 actions", revenue: "Upgraded" },
      { name: "Michael Rodriguez", email: "mike@startup.io", activity: "98 actions" },
      { name: "Jennifer Lee", email: "jen@company.com", activity: "87 actions" },
    ],
    healthMetrics: [
      { label: "Vault Adoption", value: 68, status: 'good' },
      { label: "LMS Engagement", value: 45, status: 'warning' },
      { label: "Doc Upload Rate", value: 82, status: 'good' },
    ]
  },
  ai_assistant: {
    overview: [
      { label: "Subscribers", value: "384", change: 8.3, icon: <Users className="w-5 h-5" /> },
      { label: "Avg Interactions", value: "24.6/wk", change: 3.1, icon: <MessageSquare className="w-5 h-5" /> },
      { label: "Retention Rate", value: "89%", icon: <Repeat className="w-5 h-5" /> },
      { label: "MRR", value: "$13,436", change: 11.2, icon: <DollarSign className="w-5 h-5" /> },
    ],
    recentActivity: [
      { action: "AI consultation completed", user: "Alex T.", time: "1 min ago" },
      { action: "Decision support request", user: "Linda W.", time: "4 min ago" },
      { action: "Smart reminder triggered", user: "Chris P.", time: "8 min ago" },
      { action: "Document analyzed", user: "Maria S.", time: "15 min ago" },
    ],
    topUsers: [
      { name: "Alex Thompson", email: "alex@business.com", activity: "312 interactions", revenue: "$34.99/mo" },
      { name: "Linda Williams", email: "linda@corp.io", activity: "287 interactions", revenue: "$34.99/mo" },
      { name: "Chris Peterson", email: "chris@startup.co", activity: "245 interactions", revenue: "$34.99/mo" },
    ],
    healthMetrics: [
      { label: "Feature Depth", value: 72, status: 'good' },
      { label: "Response Satisfaction", value: 94, status: 'good' },
      { label: "Upgrade Intent", value: 28, status: 'warning' },
    ]
  },
  ai_operations: {
    overview: [
      { label: "Subscribers", value: "156", change: 15.7, icon: <Users className="w-5 h-5" /> },
      { label: "Workflow Automation", value: "89%", icon: <Zap className="w-5 h-5" /> },
      { label: "ARPU", value: "$112", change: 8.2, icon: <DollarSign className="w-5 h-5" /> },
      { label: "MRR", value: "$15,599", change: 18.4, icon: <TrendingUp className="w-5 h-5" /> },
    ],
    recentActivity: [
      { action: "Workflow triggered", user: "Tech Solutions Inc", time: "30 sec ago" },
      { action: "Cash flow updated", user: "StartupXYZ", time: "2 min ago" },
      { action: "Integration synced", user: "Digital Agency", time: "5 min ago" },
      { action: "Report generated", user: "Consulting Co", time: "10 min ago" },
    ],
    topUsers: [
      { name: "Tech Solutions Inc", email: "admin@techsolutions.com", activity: "1,247 automations", revenue: "$99.99/mo" },
      { name: "StartupXYZ", email: "ops@startupxyz.io", activity: "892 automations", revenue: "$99.99/mo" },
      { name: "Digital Agency", email: "team@digitalagency.com", activity: "756 automations", revenue: "$99.99/mo" },
    ],
    healthMetrics: [
      { label: "Workflow Usage", value: 89, status: 'good' },
      { label: "Integration Health", value: 96, status: 'good' },
      { label: "Churn Risk", value: 12, status: 'good' },
    ]
  },
  ai_enterprise: {
    overview: [
      { label: "Accounts", value: "47", change: 22.4, icon: <Users className="w-5 h-5" /> },
      { label: "Total Seats", value: "395", change: 15.8, icon: <UserPlus className="w-5 h-5" /> },
      { label: "Avg ACV", value: "$5,988", icon: <DollarSign className="w-5 h-5" /> },
      { label: "MRR", value: "$23,453", change: 24.1, icon: <TrendingUp className="w-5 h-5" /> },
    ],
    recentActivity: [
      { action: "New account onboarded", user: "Acme Corp", time: "1 hour ago" },
      { action: "Seat expansion", user: "Global Industries", time: "3 hours ago" },
      { action: "Renewal completed", user: "Tech Giants LLC", time: "5 hours ago" },
      { action: "Custom integration", user: "Enterprise Co", time: "1 day ago" },
    ],
    topUsers: [
      { name: "Acme Corporation", email: "admin@acme.com", activity: "42 seats", revenue: "$6,996/yr" },
      { name: "Global Industries", email: "ops@global.io", activity: "38 seats", revenue: "$6,330/yr" },
      { name: "Tech Giants LLC", email: "it@techgiants.com", activity: "35 seats", revenue: "$5,831/yr" },
    ],
    healthMetrics: [
      { label: "Renewal Rate", value: 94, status: 'good' },
      { label: "Seat Utilization", value: 78, status: 'good' },
      { label: "Support Tickets", value: 15, status: 'warning' },
    ]
  },
  ai_advisory: {
    overview: [
      { label: "Active Clients", value: "89", change: 18.9, icon: <Users className="w-5 h-5" /> },
      { label: "Sessions This Month", value: "287", icon: <Calendar className="w-5 h-5" /> },
      { label: "Advisor Utilization", value: "78%", icon: <Clock className="w-5 h-5" /> },
      { label: "MRR", value: "$17,799", change: 12.3, icon: <DollarSign className="w-5 h-5" /> },
    ],
    recentActivity: [
      { action: "Session completed", user: "Strategic Planning - Johnson & Co", time: "30 min ago" },
      { action: "Brief prepared", user: "Growth Review - TechStart", time: "1 hour ago" },
      { action: "Session scheduled", user: "Q1 Planning - MediaGroup", time: "2 hours ago" },
      { action: "Report delivered", user: "Board Prep - Finance Inc", time: "4 hours ago" },
    ],
    topUsers: [
      { name: "Johnson & Co", email: "ceo@johnsonco.com", activity: "12 sessions", revenue: "$1,500/qtr" },
      { name: "TechStart Ventures", email: "founder@techstart.io", activity: "8 sessions", revenue: "$1,000/qtr" },
      { name: "MediaGroup Holdings", email: "cfo@mediagroup.com", activity: "6 sessions", revenue: "$750/qtr" },
    ],
    healthMetrics: [
      { label: "Client Satisfaction", value: 96, status: 'good' },
      { label: "Session Attendance", value: 92, status: 'good' },
      { label: "Advisor Availability", value: 65, status: 'warning' },
    ]
  },
  ai_tax: {
    overview: [
      { label: "Active Clients", value: "234", change: 28.6, icon: <Users className="w-5 h-5" /> },
      { label: "Doc Readiness", value: "82%", change: 5.4, icon: <FileText className="w-5 h-5" /> },
      { label: "Meetings Completed", value: "96%", icon: <CheckCircle2 className="w-5 h-5" /> },
      { label: "MRR", value: "$35,097", change: 31.2, icon: <DollarSign className="w-5 h-5" /> },
    ],
    recentActivity: [
      { action: "Tax docs uploaded", user: "Smith Family Trust", time: "5 min ago" },
      { action: "Meeting scheduled", user: "Williams LLC", time: "15 min ago" },
      { action: "Return completed", user: "Tech Founders Inc", time: "1 hour ago" },
      { action: "Extension filed", user: "Creative Agency", time: "2 hours ago" },
    ],
    topUsers: [
      { name: "Smith Family Trust", email: "john@smithtrust.com", activity: "Fully prepared", revenue: "$499/yr" },
      { name: "Williams LLC", email: "accounting@williams.com", activity: "Docs 90% ready", revenue: "$499/yr" },
      { name: "Tech Founders Inc", email: "cfo@techfounders.io", activity: "Meeting scheduled", revenue: "$499/yr" },
    ],
    healthMetrics: [
      { label: "Document Completion", value: 82, status: 'good' },
      { label: "Seasonal Retention", value: 87, status: 'good' },
      { label: "Cross-sell Success", value: 16, status: 'warning' },
    ]
  },
  ai_compliance: {
    overview: [
      { label: "Subscribers", value: "112", change: 14.2, icon: <Users className="w-5 h-5" /> },
      { label: "Active Tasks", value: "847", icon: <Activity className="w-5 h-5" /> },
      { label: "Risk Flags", value: "2.1/acct", icon: <AlertCircle className="w-5 h-5" /> },
      { label: "MRR", value: "$20,159", change: 16.8, icon: <DollarSign className="w-5 h-5" /> },
    ],
    recentActivity: [
      { action: "Deadline reminder sent", user: "Healthcare Corp", time: "1 min ago" },
      { action: "Compliance task completed", user: "Financial Services", time: "10 min ago" },
      { action: "Risk flag resolved", user: "Manufacturing Inc", time: "25 min ago" },
      { action: "Audit trail updated", user: "Tech Compliance Co", time: "1 hour ago" },
    ],
    topUsers: [
      { name: "Healthcare Corp", email: "compliance@healthcare.com", activity: "47 active tasks", revenue: "$179.99/mo" },
      { name: "Financial Services LLC", email: "risk@finserv.com", activity: "38 active tasks", revenue: "$179.99/mo" },
      { name: "Manufacturing Inc", email: "ops@manufacturing.io", activity: "32 active tasks", revenue: "$179.99/mo" },
    ],
    healthMetrics: [
      { label: "Task Completion", value: 88, status: 'good' },
      { label: "On-time Filings", value: 94, status: 'good' },
      { label: "Risk Score", value: 21, status: 'warning' },
    ]
  }
};

function PortalContent() {
  const { tierId } = useParams<{ tierId: string }>();
  const navigate = useNavigate();
  const { isOwner } = useAuth();

  // Validate tier ID
  const validTierId = tierId as UserTierId;
  const tier = USER_TIERS[validTierId];
  const data = portalData[validTierId];

  if (!tier || !data) {
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
              <Button variant="outline" size="sm">
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
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.overview.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className={cn("p-3 rounded-xl bg-gradient-to-br", tier.color, "text-white")}>
                        {metric.icon}
                      </div>
                      {metric.change && (
                        <span className="flex items-center text-sm text-green-500">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {metric.change}%
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="users">Top Users</TabsTrigger>
              <TabsTrigger value="health">Health Metrics</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Top Users
                  </CardTitle>
                  <CardDescription>Most active {tier.displayName} subscribers</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Analytics Overview
                  </CardTitle>
                  <CardDescription>Detailed analytics for {tier.displayName} tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl bg-muted/30 text-center">
                      <p className="text-4xl font-bold text-foreground">{tier.price ? `$${tier.price}` : tier.priceLabel || 'Custom'}</p>
                      <p className="text-sm text-muted-foreground mt-1">Price Point</p>
                    </div>
                    <div className="p-6 rounded-xl bg-muted/30 text-center">
                      <p className="text-4xl font-bold text-foreground">{tier.capabilities.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">Core Features</p>
                    </div>
                    <div className="p-6 rounded-xl bg-muted/30 text-center">
                      <p className="text-4xl font-bold text-foreground">{tier.limitations?.length || 0}</p>
                      <p className="text-sm text-muted-foreground mt-1">Upgrade Opportunities</p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h4 className="font-semibold text-foreground mb-4">Tier Capabilities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tier.capabilities.map((cap, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/20">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground">{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Notifications Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Tier Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-500 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Growth Alert</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tier.displayName} subscriptions up 15% this month
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2 text-yellow-500 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Attention Needed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    3 users approaching feature limits
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Opportunity</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    12 users ready for upgrade conversation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
