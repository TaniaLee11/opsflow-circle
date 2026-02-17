import { ScrollText } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function SystemLogs() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Logs</h1>
        <p className="text-muted-foreground mt-1">
          Activity logs and system events
        </p>
      </div>

      <EmptyState
        icon={ScrollText}
        title="No activity yet"
        description="Activity logs will appear as you use the platform - integrations syncing, workflows running, and system events."
        actions={[]}
      />
    </div>
  );
}
