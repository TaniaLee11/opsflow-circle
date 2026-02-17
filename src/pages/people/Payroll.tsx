import { DollarSign, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Payroll() {
  const handleSetupPayroll = () => {
    // TODO: Implement set up payroll
    console.log("Set Up Payroll clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll</h1>
          <p className="text-muted-foreground mt-1">
            Manage payroll for your team
          </p>
        </div>
        <button
          onClick={handleSetupPayroll}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Set Up Payroll
        </button>
      </div>

      <EmptyState
        icon={DollarSign}
        title="No payroll yet"
        description="Manage payroll for your team"
        actions={[
          {
            label: "Set Up Payroll",
            onClick: handleSetupPayroll,
          },
        ]}
      />
    </div>
  );
}
