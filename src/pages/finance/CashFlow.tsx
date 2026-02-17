import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function CashFlow() {
  const navigate = useNavigate();

  const handleConnectAccounting = () => {
    navigate("/integrations?category=accounting");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cash Flow</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and forecast your cash flow
        </p>
      </div>

      <EmptyState
        icon={TrendingUp}
        title="Connect your accounting software"
        description="Connect your accounting tools to see cash flow projections and trends."
        actions={[
          {
            label: "Connect Accounting Software",
            onClick: handleConnectAccounting,
          },
        ]}
      />
    </div>
  );
}
