import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headset, Inbox, Ticket, Radio, MessageSquare } from "lucide-react";

export function SupportDashboard() {
  const metrics = {
    openTickets: 0,
    avgResponseTime: 0,
    activeConversations: 0,
    satisfactionScore: 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Headset className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-sm text-muted-foreground">Manage client relationships and service</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open Tickets</CardDescription>
            <CardTitle className="text-3xl">{metrics.openTickets}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-3xl">{metrics.avgResponseTime}h</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Conversations</CardDescription>
            <CardTitle className="text-3xl">{metrics.activeConversations}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Client Satisfaction</CardDescription>
            <CardTitle className="text-3xl">{metrics.satisfactionScore}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Respond to client needs</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <Inbox className="w-4 h-4" />
            Open Inbox
          </Button>
          <Button variant="outline" className="gap-2">
            <Ticket className="w-4 h-4" />
            Create Ticket
          </Button>
          <Button variant="outline" className="gap-2">
            <Radio className="w-4 h-4" />
            Launch HGO Campaign
          </Button>
          <Button variant="outline" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Send Follow-up
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Queue</CardTitle>
            <CardDescription>Pending support requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No open tickets. Your support queue is clear!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Support Tasks</CardTitle>
            <CardDescription>Scheduled client follow-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No support tasks scheduled.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Retention Workflows</CardTitle>
            <CardDescription>Active retention campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No retention workflows active.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Latest client communications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent client messages.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
