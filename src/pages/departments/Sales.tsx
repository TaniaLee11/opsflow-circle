import { Sidebar } from "@/components/layout/Sidebar";
import { SalesDashboard } from "@/components/departments/SalesDashboard";

export default function Sales() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <SalesDashboard />
      </main>
    </div>
  );
}
