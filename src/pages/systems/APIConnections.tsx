import { Key, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function APIConnections() {
  const handleGenerateKey = () => {
    // TODO: Implement generate api key
    console.log("Generate API Key clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Connections</h1>
          <p className="text-muted-foreground mt-1">
            Manage API keys and connections
          </p>
        </div>
        <button
          onClick={handleGenerateKey}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Generate API Key
        </button>
      </div>

      <EmptyState
        icon={Key}
        title="No api connections yet"
        description="Manage API keys and connections"
        actions={[
          {
            label: "Generate API Key",
            onClick: handleGenerateKey,
          },
        ]}
      />
    </div>
  );
}
