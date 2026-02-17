import { Award } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function FundingReadiness() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Funding Readiness</h1>
        <p className="text-muted-foreground mt-1">
          Assess your readiness for funding
        </p>
      </div>

      <EmptyState
        icon={Award}
        title="Complete your financial setup"
        description="Connect your accounting software and complete your financial setup to get your funding readiness score."
        actions={[]}
      />
    </div>
  );
}
