import { UserCheck, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function ClientOnboarding() {
  const handleCreateTemplate = () => {
    // TODO: Open onboarding template builder
    console.log("Create template clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Onboarding</h1>
          <p className="text-muted-foreground mt-1">
            Streamline your client onboarding process
          </p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      <EmptyState
        icon={UserCheck}
        title="No onboarding templates yet"
        description="Create an onboarding template to ensure consistent client experiences."
        actions={[
          {
            label: "Create Template",
            onClick: handleCreateTemplate,
          },
        ]}
      />
    </div>
  );
}
