import { Plus, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Contractors() {
  const hasContractors = false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contractors</h1>
          <p className="text-muted-foreground mt-1">
            Manage contractor relationships and documents
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Contractor
        </Button>
      </div>

      {!hasContractors ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserCog className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Contractors</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Add contractors to track their information, rates, and documents.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Contractor
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
