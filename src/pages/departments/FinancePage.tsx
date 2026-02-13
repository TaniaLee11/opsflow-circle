import { Sidebar } from "@/components/layout/Sidebar";
import { FinanceDashboard } from "@/components/departments/FinanceDashboard";

export default function FinancePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <FinanceDashboard />
      </main>
    </div>
  );
}
