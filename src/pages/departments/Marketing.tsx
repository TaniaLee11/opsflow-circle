import { AppSidebar } from "@/components/layout/AppSidebar";
import { MarketingDashboard } from "@/components/departments/MarketingDashboard";

export default function Marketing() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 md:ml-64">
        <MarketingDashboard />
      </main>
    </div>
  );
}
