import { CheckCircle, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function HRCompliance() {
  const handleAddRequirement = () => {
    // TODO: Implement add requirement
    console.log("Add Requirement clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Compliance</h1>
          <p className="text-muted-foreground mt-1">
            Track compliance requirements and deadlines
          </p>
        </div>
        <button
          onClick={handleAddRequirement}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add Requirement
        </button>
      </div>

      <EmptyState
        icon={CheckCircle}
        title="No hr compliance yet"
        description="Track compliance requirements and deadlines"
        actions={[
          {
            label: "Add Requirement",
            onClick: handleAddRequirement,
          },
        ]}
      />
    </div>
  );
}
