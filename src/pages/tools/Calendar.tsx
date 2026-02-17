import { Calendar, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Calendar() {
  const handleCreateEvent = () => {
    // TODO: Implement create event
    console.log("Create Event clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage events
          </p>
        </div>
        <button
          onClick={handleCreateEvent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      <EmptyState
        icon={Calendar}
        title="No calendar yet"
        description="Schedule and manage events"
        actions={[
          {
            label: "Create Event",
            onClick: handleCreateEvent,
          },
        ]}
      />
    </div>
  );
}
