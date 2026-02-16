import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Calendar() {
  const hasEvents = false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View events, deadlines, and tasks across all departments
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {!hasEvents ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Events Scheduled</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Your calendar shows events, deadlines, and tasks from all departments.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
