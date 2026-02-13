import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCog, ShieldCheck, Banknote, FilePlus } from "lucide-react";

export function PeopleDashboard() {
  const metrics = {
    activeTeamMembers: 0,
    contractors: 0,
    payrollStatus: "Not Run",
    pendingOnboarding: 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">People</h1>
          <p className="text-sm text-muted-foreground">Manage your team and roles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Team Members</CardDescription>
            <CardTitle className="text-3xl">{metrics.activeTeamMembers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Contractors</CardDescription>
            <CardTitle className="text-3xl">{metrics.contractors}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Payroll Status</CardDescription>
            <CardTitle className="text-lg">{metrics.payrollStatus}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Onboarding</CardDescription>
            <CardTitle className="text-3xl">{metrics.pendingOnboarding}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your team</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <UserCog className="w-4 h-4" />
            Add Team Member
          </Button>
          <Button variant="outline" className="gap-2">
            <ShieldCheck className="w-4 h-4" />
            Assign Role
          </Button>
          <Button variant="outline" className="gap-2">
            <Banknote className="w-4 h-4" />
            Run Payroll
          </Button>
          <Button variant="outline" className="gap-2">
            <FilePlus className="w-4 h-4" />
            Upload Onboarding Doc
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Team List</CardTitle>
            <CardDescription>Active team members</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No team members added yet. Start building your team.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Access control overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No custom roles configured.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>People Tasks</CardTitle>
            <CardDescription>HR action items</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No people tasks scheduled.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Compliance Reminders</CardTitle>
            <CardDescription>Upcoming HR deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No compliance reminders.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
