import { Plus, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Contracts() {
  const hasContracts = false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground mt-1">
            Manage contracts and track signing status
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Upload Contract
        </Button>
      </div>

      {!hasContracts ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileCheck className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Contracts</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Upload and track contracts with clients.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Contract
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
