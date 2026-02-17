import { Calendar, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function ContentPlanner() {
  const handlePlanContent = () => {
    // TODO: Open content planning interface
    console.log("Plan content clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Planner</h1>
          <p className="text-muted-foreground mt-1">
            Plan your content across all channels
          </p>
        </div>
        <button
          onClick={handlePlanContent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Plan Content
        </button>
      </div>

      <EmptyState
        icon={Calendar}
        title="No content planned yet"
        description="Start planning your content calendar to maintain a consistent presence across all marketing channels."
        actions={[
          {
            label: "Plan Content",
            onClick: handlePlanContent,
          },
        ]}
      />
    </div>
  );
}
