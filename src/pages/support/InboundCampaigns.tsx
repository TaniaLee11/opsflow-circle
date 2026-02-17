import { TrendingUp, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function InboundCampaigns() {
  const handleCreateCampaign = () => {
    // TODO: Implement create campaign
    console.log("Create Campaign clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inbound Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Track where your leads come from
          </p>
        </div>
        <button
          onClick={handleCreateCampaign}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      <EmptyState
        icon={TrendingUp}
        title="No inbound campaigns yet"
        description="Track where your leads come from"
        actions={[
          {
            label: "Create Campaign",
            onClick: handleCreateCampaign,
          },
        ]}
      />
    </div>
  );
}
