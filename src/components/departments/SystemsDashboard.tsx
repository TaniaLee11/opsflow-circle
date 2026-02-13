import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Zap, Plug, ScrollText, Bot } from "lucide-react";

export function SystemsDashboard() {
  const metrics = {
    activeWorkflows: 0,
    automationRuns24h: 0,
    failedAutomations: 0,
    connectedIntegrations: 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Systems</h1>
          <p className="text-sm text-muted-foreground">Automate and connect your tools</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Workflows</CardDescription>
            <CardTitle className="text-3xl">{metrics.activeWorkflows}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Automation Runs (24h)</CardDescription>
            <CardTitle className="text-3xl">{metrics.automationRuns24h}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed Automations</CardDescription>
            <CardTitle className="text-3xl text-destructive">{metrics.failedAutomations}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Connected Integrations</CardDescription>
            <CardTitle className="text-3xl">{metrics.connectedIntegrations}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your automation infrastructure</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <Zap className="w-4 h-4" />
            Build Workflow
          </Button>
          <Button variant="outline" className="gap-2">
            <Plug className="w-4 h-4" />
            Add Integration
          </Button>
          <Button variant="outline" className="gap-2">
            <ScrollText className="w-4 h-4" />
            View Logs
          </Button>
          <Button variant="outline" className="gap-2">
            <Bot className="w-4 h-4" />
            Test Automation
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Status</CardTitle>
            <CardDescription>Active automation overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No active workflows. Build your first automation to streamline operations.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Error Log</CardTitle>
            <CardDescription>Recent automation issues</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No errors logged. All systems running smoothly.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Integration Health</CardTitle>
            <CardDescription>Connected services status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No integrations connected yet.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Activity Feed</CardTitle>
            <CardDescription>Recent automation events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent system activity.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
