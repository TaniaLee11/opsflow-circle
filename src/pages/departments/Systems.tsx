import { Sidebar } from "@/components/layout/Sidebar";
import { SystemsDashboard } from "@/components/departments/SystemsDashboard";

export default function Systems() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <SystemsDashboard />
      </main>
    </div>
  );
}
