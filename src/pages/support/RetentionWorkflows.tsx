import { Repeat, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function RetentionWorkflows() {
  const handleCreateWorkflow = () => {
    // TODO: Implement create workflow
    console.log("Create Workflow clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Retention Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Build workflows to keep customers engaged
          </p>
        </div>
        <button
          onClick={handleCreateWorkflow}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Workflow
        </button>
      </div>

      <EmptyState
        icon={Repeat}
        title="No retention workflows yet"
        description="Build workflows to keep customers engaged"
        actions={[
          {
            label: "Create Workflow",
            onClick: handleCreateWorkflow,
          },
        ]}
      />
    </div>
  );
}
