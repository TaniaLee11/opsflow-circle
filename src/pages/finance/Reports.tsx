import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Reports() {
  const navigate = useNavigate();

  const handleConnectAccounting = () => {
    navigate("/integrations?category=accounting");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Financial reports and business analytics
        </p>
      </div>

      <EmptyState
        icon={BarChart3}
        title="Connect your accounting software"
        description="Connect your accounting tools to generate P&L statements, balance sheets, and custom reports."
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
