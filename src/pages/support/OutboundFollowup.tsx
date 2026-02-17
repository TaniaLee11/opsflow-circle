import { UserPlus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function OutboundFollowup() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Outbound Follow-up</h1>
        <p className="text-muted-foreground mt-1">
          Automated follow-ups for stale contacts
        </p>
      </div>

      <EmptyState
        icon={UserPlus}
        title="No follow-ups needed right now"
        description="This page auto-populates from stale CRM and pipeline data. When contacts need attention, they'll appear here."
        actions={[]}
      />
    </div>
  );
}
