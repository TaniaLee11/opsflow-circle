import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Banking() {
  const navigate = useNavigate();

  const handleConnectBank = () => {
    navigate("/integrations?category=banking");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Banking</h1>
        <p className="text-muted-foreground mt-1">
          View account balances and transactions
        </p>
      </div>

      <EmptyState
        icon={Building2}
        title="Connect your bank accounts"
        description="Connect your business bank accounts to see balances and transactions in real-time."
        actions={[
          {
            label: "Connect Bank Account",
            onClick: handleConnectBank,
          },
        ]}
      />
    </div>
  );
}
