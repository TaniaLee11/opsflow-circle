import { Radio, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Broadcast() {
  const handleCreateBroadcast = () => {
    // TODO: Open broadcast creation modal
    console.log("Create broadcast clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Broadcast</h1>
          <p className="text-muted-foreground mt-1">
            Send mass communications to your audience
          </p>
        </div>
        <button
          onClick={handleCreateBroadcast}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          New Broadcast
        </button>
      </div>

      <EmptyState
        icon={Radio}
        title="No broadcasts yet"
        description="Compose your first broadcast to communicate with your entire audience at once."
        actions={[
          {
            label: "Create Broadcast",
            onClick: handleCreateBroadcast
          },
        ]}
      />
    </div>
  );
}
