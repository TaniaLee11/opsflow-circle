import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Tax() {
  const navigate = useNavigate();

  const handleConnectAccounting = () => {
    navigate("/integrations?category=accounting");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tax Organizer</h1>
        <p className="text-muted-foreground mt-1">
          Organize tax documents and track deadlines
        </p>
      </div>

      <EmptyState
        icon={FileText}
        title="Connect your accounting software"
        description="Connect your accounting tools to import tax data and track important deadlines."
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
