import { FileText, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function OnboardingDocuments() {
  const handleAddDocument = () => {
    // TODO: Implement add document
    console.log("Add Document clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Onboarding Documents</h1>
          <p className="text-muted-foreground mt-1">
            Define required documents for new team members
          </p>
        </div>
        <button
          onClick={handleAddDocument}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      <EmptyState
        icon={FileText}
        title="No onboarding documents yet"
        description="Define required documents for new team members"
        actions={[
          {
            label: "Add Document",
            onClick: handleAddDocument,
          },
        ]}
      />
    </div>
  );
}
