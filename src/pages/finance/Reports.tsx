import { BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  const hasReports = false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Financial reports and business intelligence
          </p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {!hasReports ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Reports Generated Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Connect your accounting software to generate P&L, cash flow, and tax reports.
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
