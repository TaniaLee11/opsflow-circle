import { useNavigate } from "react-router-dom";
import { Megaphone, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Campaigns() {
  const navigate = useNavigate();

  const handleCreateCampaign = () => {
    // TODO: Open campaign creation modal
    console.log("Create campaign clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Plan and execute marketing campaigns across all channels
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
        icon={Megaphone}
        title="No campaigns yet"
        description="Create your first marketing campaign to reach your audience across multiple channels."
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
