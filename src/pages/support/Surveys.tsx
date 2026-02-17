import { ClipboardList, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Surveys() {
  const handleCreateSurvey = () => {
    // TODO: Implement create survey
    console.log("Create Survey clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Surveys</h1>
          <p className="text-muted-foreground mt-1">
            Collect feedback from your customers
          </p>
        </div>
        <button
          onClick={handleCreateSurvey}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Survey
        </button>
      </div>

      <EmptyState
        icon={ClipboardList}
        title="No surveys yet"
        description="Collect feedback from your customers"
        actions={[
          {
            label: "Create Survey",
            onClick: handleCreateSurvey,
          },
        ]}
      />
    </div>
  );
}
