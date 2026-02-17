import { CheckSquare, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Tasks() {
  const handleCreateTask = () => {
    // TODO: Implement create task
    console.log("Create Task clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Track tasks and to-dos
          </p>
        </div>
        <button
          onClick={handleCreateTask}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      <EmptyState
        icon={CheckSquare}
        title="No tasks yet"
        description="Track tasks and to-dos"
        actions={[
          {
            label: "Create Task",
            onClick: handleCreateTask,
          },
        ]}
      />
    </div>
  );
}
