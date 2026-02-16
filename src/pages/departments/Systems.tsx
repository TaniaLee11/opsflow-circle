import { AppSidebar } from "@/components/layout/AppSidebar";
import { SystemsDashboard } from "@/components/departments/SystemsDashboard";

export default function Systems() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 md:ml-64">
        <SystemsDashboard />
      </main>
    </div>
  );
}
