import { Navigation } from "@/components/layout/Navigation";
import { MarketingDashboard } from "@/components/departments/MarketingDashboard";

export default function Marketing() {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 overflow-y-auto">
        <MarketingDashboard />
      </main>
    </div>
  );
}
