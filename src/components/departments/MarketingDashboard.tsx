import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Target, Sparkles, Workflow, UserPlus } from "lucide-react";

export function MarketingDashboard() {
  // TODO: Replace with real data from database
  const metrics = {
    activeCampaigns: 0,
    leadsGenerated: 0,
    conversionRate: 0,
    contentScheduled: 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Megaphone className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Marketing</h1>
          <p className="text-sm text-muted-foreground">Attract and grow your audience</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Campaigns</CardDescription>
            <CardTitle className="text-3xl">{metrics.activeCampaigns}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Leads Generated (30d)</CardDescription>
            <CardTitle className="text-3xl">{metrics.leadsGenerated}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversion Rate</CardDescription>
            <CardTitle className="text-3xl">{metrics.conversionRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Content Scheduled This Week</CardDescription>
            <CardTitle className="text-3xl">{metrics.contentScheduled}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Start a new marketing initiative</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <Target className="w-4 h-4" />
            Create Campaign
          </Button>
          <Button variant="outline" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Open Studio
          </Button>
          <Button variant="outline" className="gap-2">
            <Workflow className="w-4 h-4" />
            Build Funnel
          </Button>
          <Button variant="outline" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Capture Lead
          </Button>
        </CardContent>
      </Card>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Recent campaign metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No active campaigns yet. Create your first campaign to see performance data.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketing Tasks</CardTitle>
            <CardDescription>Upcoming marketing activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No marketing tasks scheduled. VOPSy can help you plan your next campaign.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Calendar</CardTitle>
            <CardDescription>Scheduled content overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Content calendar is empty. Start planning your content strategy.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Activity</CardTitle>
            <CardDescription>Recent lead interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent lead activity. Start capturing leads to see engagement data.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
