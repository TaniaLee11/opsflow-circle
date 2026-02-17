import { useNavigate } from "react-router-dom";
import { DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FinanceDashboard() {
  const navigate = useNavigate();

  // All metrics start at zero - no fake data
  const metrics = [
    { label: "Active Items", value: 0, change: 0 },
    { label: "This Month", value: "$0", change: 0 },
    { label: "Completion Rate", value: "0%", change: 0 },
    { label: "Pending", value: 0, change: 0 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance</h1>
        <p className="text-muted-foreground mt-1">
          Finance department overview
        </p>
      </div>

      {/* Metrics - all zero */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Data will populate as integrations connect
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions - buttons navigate to correct pages */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Quick action buttons will appear here based on your finance workflows.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
