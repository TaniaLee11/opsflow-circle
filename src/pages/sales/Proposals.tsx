import { FileText, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Proposals() {
  const handleCreateProposal = () => {
    // TODO: Open proposal builder
    console.log("Create proposal clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-muted-foreground mt-1">
            Create and send professional proposals
          </p>
        </div>
        <button
          onClick={handleCreateProposal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Proposal
        </button>
      </div>

      <EmptyState
        icon={FileText}
        title="No proposals yet"
        description="Create your first proposal to send to potential clients."
        actions={[
          {
            label: "Create Proposal",
            onClick: handleCreateProposal,
          },
        ]}
      />
    </div>
  );
}
