import { Sidebar } from "@/components/layout/Sidebar";
import { MarketingDashboard } from "@/components/departments/MarketingDashboard";

export default function Marketing() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <MarketingDashboard />
      </main>
    </div>
  );
}
