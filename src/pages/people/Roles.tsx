import { Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Roles() {
  const hasRoles = true;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Configure team member access and permissions
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      {hasRoles ? (
        <Card>
          <CardHeader>
            <CardTitle>Role Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set up roles to control what team members can access. Default roles: Owner, Manager, Team Member, Contractor.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
