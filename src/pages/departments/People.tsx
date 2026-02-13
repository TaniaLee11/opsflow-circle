import { Sidebar } from "@/components/layout/Sidebar";
import { PeopleDashboard } from "@/components/departments/PeopleDashboard";

export default function People() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <PeopleDashboard />
      </main>
    </div>
  );
}
