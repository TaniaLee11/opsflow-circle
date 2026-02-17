import { FileSignature, Plus, Upload } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Contracts() {
  const handleCreateContract = () => {
    // TODO: Open contract builder
    console.log("Create contract clicked");
  };

  const handleUploadContract = () => {
    // TODO: Open file upload
    console.log("Upload contract clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground mt-1">
            Manage client contracts and agreements
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUploadContract}
            className="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={handleCreateContract}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Create Contract
          </button>
        </div>
      </div>

      <EmptyState
        icon={FileSignature}
        title="No contracts yet"
        description="Upload or create your first contract to manage client agreements."
        actions={[
          {
            label: "Create Contract",
            onClick: handleCreateContract,
          },
          {
            label: "Upload Contract",
            onClick: handleUploadContract,
            variant: "outline",
          },
        ]}
      />
    </div>
  );
}
