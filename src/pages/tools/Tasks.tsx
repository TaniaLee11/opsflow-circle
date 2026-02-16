import { Plus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Tasks() {
  const hasTasks = false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage tasks and to-dos across your organization
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {!hasTasks ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckSquare className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tasks</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create tasks to stay organized and track what needs to be done.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
