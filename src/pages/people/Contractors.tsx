import { Users, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Contractors() {
  const handleAddContractor = () => {
    // TODO: Implement add contractor
    console.log("Add Contractor clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contractors</h1>
          <p className="text-muted-foreground mt-1">
            Manage independent contractors and 1099 workers
          </p>
        </div>
        <button
          onClick={handleAddContractor}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add Contractor
        </button>
      </div>

      <EmptyState
        icon={Users}
        title="No contractors yet"
        description="Manage independent contractors and 1099 workers"
        actions={[
          {
            label: "Add Contractor",
            onClick: handleAddContractor,
          },
        ]}
      />
    </div>
  );
}
