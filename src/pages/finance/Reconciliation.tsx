import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";

export default function Reconciliation() {
  const navigate = useNavigate();

  const handleConnectAccounting = () => {
    navigate("/integrations?category=accounting");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reconciliation</h1>
        <p className="text-muted-foreground mt-1">
          Categorize and reconcile transactions from your accounting software
        </p>
      </div>

      <EmptyState
        icon={RefreshCw}
        title="Connect your accounting software"
        description="Connect QuickBooks, Wave, Xero, or Stripe to start reconciling transactions."
        actions={[
          {
            label: "Connect Accounting Software",
            onClick: handleConnectAccounting,
          },
        ]}
      />

      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Integration:</strong> Reads from QuickBooks/Wave/Xero/Stripe. Transactions appear here for categorization and reconciliation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
