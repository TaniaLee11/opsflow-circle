import { Zap, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function AIProcessTriggers() {
  const handleCreateTrigger = () => {
    // TODO: Open trigger builder
    console.log("Create trigger clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Process Triggers</h1>
          <p className="text-muted-foreground mt-1">
            Tell VOPSy what to watch for and automate
          </p>
        </div>
        <button
          onClick={handleCreateTrigger}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Trigger
        </button>
      </div>

      <EmptyState
        icon={Zap}
        title="No triggers set up yet"
        description="Tell VOPSy what to watch for - new leads, stale deals, overdue invoices - and let AI handle the follow-up."
        actions={[
          {
            label: "Create Trigger",
            onClick: handleCreateTrigger,
          },
        ]}
      />
    </div>
  );
}
