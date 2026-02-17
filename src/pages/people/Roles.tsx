import { Shield, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function RolesPermissions() {
  const handleCreateRole = () => {
    // TODO: Implement create role
    console.log("Create Role clicked");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Define roles and permissions for your team
          </p>
        </div>
        <button
          onClick={handleCreateRole}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      <EmptyState
        icon={Shield}
        title="No roles & permissions yet"
        description="Define roles and permissions for your team"
        actions={[
          {
            label: "Create Role",
            onClick: handleCreateRole,
          },
        ]}
      />
    </div>
  );
}
