import { useNavigate } from "react-router-dom";
import { Users, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";

export default function CRM() {
  const navigate = useNavigate();

  const handleAddContact = () => {
    // TODO: Open contact creation modal
    console.log("Add contact clicked");
  };

  const handleConnectIntegration = () => {
    navigate("/integrations?category=crm");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM</h1>
          <p className="text-muted-foreground mt-1">
            All your contacts in one place
          </p>
        </div>
        <button
          onClick={handleAddContact}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      <EmptyState
        icon={Users}
        title="No contacts yet"
        description="Add your first contact or connect an integration to sync existing contacts from GoHighLevel, Google, or Gmail."
        actions={[
          {
            label: "Add Contact",
            onClick: handleAddContact,
          },
          {
            label: "Connect Integration",
            onClick: handleConnectIntegration,
            variant: "outline",
          },
        ]}
      />
    </div>
  );
}
