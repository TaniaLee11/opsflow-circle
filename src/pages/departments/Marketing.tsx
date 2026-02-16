import { Navigation } from "@/components/layout/Navigation";
import { MarketingDashboard } from "@/components/departments/MarketingDashboard";

export default function Marketing() {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 md:ml-64">
        <MarketingDashboard />
      </main>
    </div>
  );
}
