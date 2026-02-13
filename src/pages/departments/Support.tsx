import { Sidebar } from "@/components/layout/Sidebar";
import { SupportDashboard } from "@/components/departments/SupportDashboard";

export default function Support() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <SupportDashboard />
      </main>
    </div>
  );
}
