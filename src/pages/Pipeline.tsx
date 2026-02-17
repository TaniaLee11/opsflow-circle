import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";

// Deal sources
type DealSource = "ghl" | "dotloop" | "manual";

const SOURCE_LABELS: Record<DealSource, string> = {
  ghl: "GoHighLevel",
  dotloop: "dotloop",
  manual: "Manual",
};

const PIPELINE_STAGES = [
  { id: "lead", label: "Lead", color: "bg-gray-100" },
  { id: "qualified", label: "Qualified", color: "bg-blue-100" },
  { id: "proposal", label: "Proposal", color: "bg-yellow-100" },
  { id: "negotiation", label: "Negotiation", color: "bg-orange-100" },
  { id: "closed", label: "Closed Won", color: "bg-green-100" },
];

export default function Pipeline() {
  const navigate = useNavigate();

  const handleAddDeal = () => {
    // TODO: Open deal creation modal
    console.log("Add deal clicked");
  };

  const handleConnectGHL = () => {
    navigate("/integrations?tool=gohighlevel");
  };

  const handleConnectDotloop = () => {
    navigate("/integrations?tool=dotloop");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Track every deal from first contact to closed
          </p>
        </div>
        <Button onClick={handleAddDeal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Kanban Board - Keep columns visible but empty */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {PIPELINE_STAGES.map((stage) => (
          <Card key={stage.id} className={stage.color}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
              <p className="text-xs text-muted-foreground">0 deals • $0</p>
            </CardHeader>
            <CardContent className="min-h-[200px]">
              {/* Empty - deals will appear here when added */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      <EmptyState
        icon={Plus}
        title="No deals in your pipeline yet"
        description="Add your first deal manually or connect GoHighLevel and dotloop to sync existing pipeline data automatically."
        actions={[
          {
            label: "Add Deal",
            onClick: handleAddDeal,
          },
          {
            label: "Connect GoHighLevel",
            onClick: handleConnectGHL,
            variant: "outline",
          },
          {
            label: "Connect dotloop",
            onClick: handleConnectDotloop,
            variant: "outline",
          },
        ]}
      />

      {/* Integration Note */}
      <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Integration:</strong> Pipeline pulls from GoHighLevel + dotloop + manual entries. Connect your tools to see all deals in one unified view.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
