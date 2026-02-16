import { Plus, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Deals() {
  const hasDeals = false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <p className="text-muted-foreground mt-1">
            Track deal progress and revenue opportunities
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Deal
        </Button>
      </div>

      {!hasDeals ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Handshake className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Deals in Progress</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create your first deal to start tracking revenue opportunities. Deals sync from GoHighLevel and dotloop.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Deal
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
