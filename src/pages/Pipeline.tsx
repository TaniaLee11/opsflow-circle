import { useState } from "react";
import { Plus, Grip, ExternalLink, Calendar, DollarSign, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Deal sources
type DealSource = "ghl" | "dotloop" | "manual";

interface Deal {
  id: string;
  title: string;
  value: number;
  contact: string;
  expectedClose: string;
  source: DealSource;
  stage: string;
  daysInStage: number;
}

const SOURCE_COLORS: Record<DealSource, string> = {
  ghl: "bg-blue-100 text-blue-700 border-blue-200",
  dotloop: "bg-purple-100 text-purple-700 border-purple-200",
  manual: "bg-gray-100 text-gray-700 border-gray-200",
};

const SOURCE_LABELS: Record<DealSource, string> = {
  ghl: "GoHighLevel",
  dotloop: "dotloop",
  manual: "Manual",
};

export default function Pipeline() {
  // Mock data - will be replaced with real GHL + dotloop + manual deal data
  const [deals] = useState<Deal[]>([
    {
      id: "1",
      title: "Tax Prep Services - Smith Family",
      value: 1200,
      contact: "John Smith",
      expectedClose: "2026-03-15",
      source: "ghl",
      stage: "Lead",
      daysInStage: 3,
    },
    {
      id: "2",
      title: "Real Estate Transaction - 123 Main St",
      value: 8500,
      contact: "Sarah Johnson",
      expectedClose: "2026-04-01",
      source: "dotloop",
      stage: "Qualified",
      daysInStage: 7,
    },
    {
      id: "3",
      title: "Bookkeeping Services - ABC Corp",
      value: 2400,
      contact: "Mike Davis",
      expectedClose: "2026-03-20",
      source: "manual",
      stage: "Proposal",
      daysInStage: 12,
    },
  ]);

  const stages = [
    { id: "lead", name: "Lead", color: "bg-gray-100" },
    { id: "qualified", name: "Qualified", color: "bg-blue-100" },
    { id: "proposal", name: "Proposal", color: "bg-yellow-100" },
    { id: "negotiation", name: "Negotiation", color: "bg-orange-100" },
    { id: "closed-won", name: "Closed Won", color: "bg-green-100" },
    { id: "closed-lost", name: "Closed Lost", color: "bg-red-100" },
  ];

  const getDealsByStage = (stageName: string) => {
    return deals.filter((d) => d.stage.toLowerCase() === stageName.toLowerCase());
  };

  const totalPipelineValue = deals
    .filter((d) => !d.stage.toLowerCase().includes("closed"))
    .reduce((sum, d) => sum + d.value, 0);

  const staleDeals = deals.filter((d) => d.daysInStage > 14);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Track deals from lead to close across all sources
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{deals.length}</p>
            <p className="text-xs text-muted-foreground mt-1">In pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalPipelineValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total potential</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Deal Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${deals.length > 0 ? Math.round(totalPipelineValue / deals.length).toLocaleString() : 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Per deal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{staleDeals.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Stale deals (14+ days)</p>
          </CardContent>
        </Card>
      </div>

      {/* Stale Deals Alert */}
      {staleDeals.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              {staleDeals.length} {staleDeals.length === 1 ? "deal" : "deals"} need attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              These deals haven't moved in 14+ days. Consider reaching out or moving them forward.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.name);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div key={stage.id} className="w-80 flex-shrink-0">
                <Card className={cn("h-full", stage.color)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">
                        {stage.name}
                      </CardTitle>
                      <Badge variant="secondary">{stageDeals.length}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ${stageValue.toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stageDeals.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No deals in this stage
                      </p>
                    ) : (
                      stageDeals.map((deal) => (
                        <Card
                          key={deal.id}
                          className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Deal Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm leading-tight">
                                  {deal.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {deal.contact}
                                </p>
                              </div>
                              <Grip className="w-4 h-4 text-muted-foreground flex-shrink-0 cursor-grab" />
                            </div>

                            {/* Deal Value */}
                            <div className="flex items-center gap-1 text-green-600 font-semibold">
                              <DollarSign className="w-4 h-4" />
                              {deal.value.toLocaleString()}
                            </div>

                            {/* Expected Close */}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              Close: {new Date(deal.expectedClose).toLocaleDateString()}
                            </div>

                            {/* Source Badge */}
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className={cn("text-xs", SOURCE_COLORS[deal.source])}
                              >
                                {SOURCE_LABELS[deal.source]}
                              </Badge>
                              {deal.daysInStage > 14 && (
                                <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                                  {deal.daysInStage}d
                                </Badge>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                View
                              </Button>
                              <Button size="sm" variant="ghost" className="px-2">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration Status */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Deal Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge className={SOURCE_COLORS.ghl}>GoHighLevel</Badge>
              <span className="text-muted-foreground">
                Synced opportunities and contacts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={SOURCE_COLORS.dotloop}>dotloop</Badge>
              <span className="text-muted-foreground">
                Real estate transactions via Production Sync
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={SOURCE_COLORS.manual}>Manual</Badge>
              <span className="text-muted-foreground">
                Deals created directly in Hub
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
