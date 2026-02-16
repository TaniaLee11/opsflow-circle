import { AppSidebar } from "@/components/layout/AppSidebar";
import { PeopleDashboard } from "@/components/departments/PeopleDashboard";

export default function People() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 md:ml-64">
        <PeopleDashboard />
      </main>
    </div>
  );
}
