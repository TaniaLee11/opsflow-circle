import { AppSidebar } from "@/components/layout/AppSidebar";
import { SupportDashboard } from "@/components/departments/SupportDashboard";

export default function Support() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 md:ml-64">
        <SupportDashboard />
      </main>
    </div>
  );
}
