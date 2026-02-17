import { Target, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Deals() {
  const handleAddDeal = () => {
    // TODO: Open deal creation modal
    console.log("Add deal clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <p className="text-muted-foreground mt-1">
            Track your deals and opportunities
          </p>
        </div>
        <button
          onClick={handleAddDeal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add Deal
        </button>
      </div>

      <EmptyState
        icon={Target}
        title="No deals yet"
        description="Track your deals here. Add your first deal or sync from GoHighLevel."
        actions={[
          {
            label: "Add Deal",
            onClick: handleAddDeal,
          },
        ]}
      />
    </div>
  );
}
