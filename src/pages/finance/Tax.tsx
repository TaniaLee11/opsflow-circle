import { Calculator, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Tax() {
  const hasData = true;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Organizer</h1>
          <p className="text-muted-foreground mt-1">
            Track tax deadlines, documents, and estimated liability
          </p>
        </div>
        <Button>
          <Calculator className="w-4 h-4 mr-2" />
          View Tax Calendar
        </Button>
      </div>

      {hasData ? (
        <div className="space-y-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Next Deadline: Q1 2026 Estimated Tax Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Due April 15, 2026 (58 days remaining)
              </p>
              <div className="flex gap-2">
                <Button size="sm">Set Reminder</Button>
                <Button size="sm" variant="outline">Mark Paid</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Season Preparation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Stay organized with upcoming tax deadlines and required documents. Connect your accounting software to auto-generate expense summaries.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
