import { Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Tickets() {
  const hasTickets = false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Track and resolve client support requests
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {!hasTickets ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Ticket className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Support Tickets</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create tickets to track and resolve client issues.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
