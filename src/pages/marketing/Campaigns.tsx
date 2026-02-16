import { useState } from "react";
import { Plus, TrendingUp, DollarSign, Users, Target, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Campaigns() {
  // Mock data - will be replaced with real data
  const campaigns = [
    {
      id: 1,
      name: "Q1 2026 Launch Campaign",
      status: "active",
      dateRange: "Feb 1 - Mar 31, 2026",
      channels: ["Social Media", "Email", "Ads"],
      leads: 127,
      spend: 2500,
      revenue: 15400,
      costPerLead: 19.69,
    },
    {
      id: 2,
      name: "Tax Season Awareness",
      status: "active",
      dateRange: "Jan 15 - Apr 15, 2026",
      channels: ["Social Media", "Content"],
      leads: 89,
      spend: 800,
      revenue: 8900,
      costPerLead: 8.99,
    },
    {
      id: 3,
      name: "Holiday Promotion 2025",
      status: "completed",
      dateRange: "Nov 15 - Dec 31, 2025",
      channels: ["Email", "Social Media", "Ads"],
      leads: 234,
      spend: 4200,
      revenue: 28600,
      costPerLead: 17.95,
    },
  ];

  const hasCampaigns = campaigns.length > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Track marketing campaigns and measure ROI
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Summary Cards */}
      {hasCampaigns && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {campaigns.filter(c => c.status === "active").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Running now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {campaigns.reduce((sum, c) => sum + c.leads, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">All campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${campaigns.reduce((sum, c) => sum + c.spend, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Marketing investment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                ${campaigns.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">From campaigns</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaigns List */}
      {!hasCampaigns ? (
        // Empty State
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Campaigns Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create your first marketing campaign to track leads, measure ROI, and understand what's working.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Campaigns</h2>
          
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {campaign.dateRange}
                    </CardDescription>
                  </div>
                  <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Channels */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Channels</p>
                  <div className="flex gap-2">
                    {campaign.channels.map((channel) => (
                      <Badge key={channel} variant="outline">{channel}</Badge>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Leads</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {campaign.leads}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Spend</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {campaign.spend.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {campaign.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cost/Lead</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      ${campaign.costPerLead.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* ROI */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className="text-sm font-semibold text-green-600">
                      {((campaign.revenue / campaign.spend - 1) * 100).toFixed(0)}% return
                    </p>
                  </div>
                  <Progress 
                    value={Math.min((campaign.revenue / campaign.spend) * 10, 100)} 
                    className="h-2"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="outline">Edit</Button>
                  {campaign.status === "active" && (
                    <Button size="sm" variant="ghost">Pause</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Helpful Tips */}
      {hasCampaigns && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Campaign Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track every marketing initiative as a campaign to understand what drives results. A good cost-per-lead varies by industry, but aim for 3-5x ROI minimum.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
