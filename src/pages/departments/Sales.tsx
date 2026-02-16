import { Navigation } from "@/components/layout/Navigation";
import { SalesDashboard } from "@/components/departments/SalesDashboard";

export default function Sales() {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 overflow-y-auto">
        <SalesDashboard />
      </main>
    </div>
  );
}
