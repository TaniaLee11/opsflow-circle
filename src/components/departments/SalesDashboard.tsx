import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Handshake, FileSignature, Building2 } from "lucide-react";

export function SalesDashboard() {
  // TODO: Replace with real data from database
  const metrics = {
    dealsInPipeline: 0,
    revenueForecast: 0,
    closedWon30d: 0,
    avgDealSize: 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-sm text-muted-foreground">Convert leads into revenue</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Deals in Pipeline</CardDescription>
            <CardTitle className="text-3xl">{metrics.dealsInPipeline}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue Forecast</CardDescription>
            <CardTitle className="text-3xl">${metrics.revenueForecast.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Closed Won (30d)</CardDescription>
            <CardTitle className="text-3xl">{metrics.closedWon30d}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Deal Size</CardDescription>
            <CardTitle className="text-3xl">${metrics.avgDealSize.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your sales pipeline</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <Handshake className="w-4 h-4" />
            Add Deal
          </Button>
          <Button variant="outline" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Move Deal Stage
          </Button>
          <Button variant="outline" className="gap-2">
            <FileSignature className="w-4 h-4" />
            Create Proposal
          </Button>
          <Button variant="outline" className="gap-2">
            <Building2 className="w-4 h-4" />
            View CRM
          </Button>
        </CardContent>
      </Card>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Kanban</CardTitle>
            <CardDescription>Visual deal flow</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No deals in pipeline yet. Add your first deal to start tracking sales progress.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Calendar</CardTitle>
            <CardDescription>Upcoming meetings and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No sales activities scheduled. VOPSy can help you organize your follow-ups.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follow-up Tasks</CardTitle>
            <CardDescription>Pending sales actions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No follow-up tasks. Add deals to your pipeline to track next steps.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Closed Deals</CardTitle>
            <CardDescription>Latest wins</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No closed deals yet. Keep working your pipeline!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
