import { Waves, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CashFlow() {
  const hasData = false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cash Flow</h1>
          <p className="text-muted-foreground mt-1">
            Track money in vs money out with 30/60/90 day projections
          </p>
        </div>
        <Button>
          <TrendingUp className="w-4 h-4 mr-2" />
          View Projections
        </Button>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Waves className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Cash Flow Tracking</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Connect your accounting software to see your cash flow and projections.
            </p>
            <Button>
              Connect Accounting Software
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
