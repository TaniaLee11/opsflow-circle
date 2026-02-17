import { DollarSign, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function DonationGrantTracking() {
  const handleAddGrant = () => {
    // TODO: Implement add grant
    console.log("Add Grant clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Donation & Grant Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track grants and donations for nonprofits
          </p>
        </div>
        <button
          onClick={handleAddGrant}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add Grant
        </button>
      </div>

      <EmptyState
        icon={DollarSign}
        title="No donation & grant tracking yet"
        description="Track grants and donations for nonprofits"
        actions={[
          {
            label: "Add Grant",
            onClick: handleAddGrant,
          },
        ]}
      />
    </div>
  );
}
