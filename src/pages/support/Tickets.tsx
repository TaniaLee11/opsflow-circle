import { Ticket, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Tickets() {
  const handleCreateTicket = () => {
    // TODO: Implement create ticket
    console.log("Create Ticket clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer support tickets
          </p>
        </div>
        <button
          onClick={handleCreateTicket}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Ticket
        </button>
      </div>

      <EmptyState
        icon={Ticket}
        title="No tickets yet"
        description="Manage customer support tickets"
        actions={[
          {
            label: "Create Ticket",
            onClick: handleCreateTicket,
          },
        ]}
      />
    </div>
  );
}
