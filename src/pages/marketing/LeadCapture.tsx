import { UserPlus, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function LeadCapture() {
  const handleCreateForm = () => {
    // TODO: Open lead capture form builder
    console.log("Create form clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Capture</h1>
          <p className="text-muted-foreground mt-1">
            Create forms and landing pages to capture leads
          </p>
        </div>
        <button
          onClick={handleCreateForm}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Form
        </button>
      </div>

      <EmptyState
        icon={UserPlus}
        title="No lead capture forms yet"
        description="Create your first lead capture form to start collecting contact information from potential customers."
        actions={[
          {
            label: "Create Form",
            onClick: handleCreateForm,
          },
        ]}
      />
    </div>
  );
}
