import { AppSidebar } from "@/components/layout/AppSidebar";
import { SalesDashboard } from "@/components/departments/SalesDashboard";

export default function Sales() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 md:ml-64">
        <SalesDashboard />
      </main>
    </div>
  );
}
