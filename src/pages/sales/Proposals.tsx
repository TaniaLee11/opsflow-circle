import { Plus, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Proposals() {
  const hasProposals = false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-muted-foreground mt-1">
            Create and track proposals sent to prospects
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </Button>
      </div>

      {!hasProposals ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileSignature className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Proposals</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create professional proposals to send to your prospects.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Proposal
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
