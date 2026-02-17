import { useNavigate } from "react-router-dom";
import { TrendingUp, Plus } from 'lucide-react';
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";

export default function Funnels() {
  const navigate = useNavigate();

  const handleCreateFunnel = () => {
    // TODO: Open funnel builder
    console.log("Create funnel clicked");
  };

  const handleConnectGHL = () => {
    navigate("/integrations?tool=gohighlevel");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-7 h-7" />
            Funnels
          </h1>
          <p className="text-muted-foreground mt-1">Visual funnel builder — guide people from discovery to decision</p>
        </div>
        <button
          onClick={handleCreateFunnel}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Funnel
        </button>
      </div>

      <EmptyState
        icon={TrendingUp}
        title="No funnels yet"
        description="Create your first funnel or connect GoHighLevel to sync existing funnels with live performance data."
        actions={[
          {
            label: "Create Funnel",
            onClick: handleCreateFunnel,
          },
          {
            label: "Connect GoHighLevel",
            onClick: handleConnectGHL,
            variant: "outline",
          },
        ]}
      />

      {/* Integration Note */}
      <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Integration:</strong> GoHighLevel funnels sync here automatically. If you have funnels in your GHL account (or managed through Virtual OPS Hub's GHL), they appear with live performance data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
